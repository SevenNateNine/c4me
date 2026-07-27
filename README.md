# c4me

A college search and application tracker for high-school students. Students
build a profile from their test scores, GPA and coursework, search a database of
US colleges, get schools ranked against their own numbers, and track where they
have applied. Administrators load reference data from public sources and review
applications whose reported outcomes look implausible.

Built as a CSE 416 project at Stony Brook University.

## Contents

- [What it does](#what-it-does)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running](#running)
- [Loading data](#loading-data)
- [API reference](#api-reference)
- [Project layout](#project-layout)
- [Security](#security)

## What it does

**For students**

- Register and maintain a profile: high school, graduation year, intended
  majors, GPA, SAT/ACT scores, SAT subject tests and AP count.
- Search colleges by admission rate, cost, size, region, state, ranking, test
  score ranges and offered majors. A *strict* search requires every filter to
  match; a *lax* search also accepts schools with missing data for a filter.
- Rank search results against your own profile. The score compares your numbers
  both to the school's published averages and to the averages of students who
  were actually accepted there.
- Track applications and their status (Pending, Waitlisted, Accepted, Rejected,
  Deferred, Withdrawn).
- View a scatter plot of applications to a given school, filtered by high school,
  graduating class and outcome, to see where your numbers place you.
- Find high schools similar to your own, scored on test averages, AP enrollment,
  state, and the colleges and majors their students pursue.

**For administrators**

- Import college data from the US Department of Education College Scorecard, and
  scrape rankings and per-school detail.
- Import student and application records from CSV.
- Review applications flagged as *questionable* — a reported acceptance whose
  GPA and test scores fall well below the school's published ranges — and either
  clear the flag or delete the record.

## Architecture

Three pieces, each independently runnable:

| Piece | Location | Stack |
| --- | --- | --- |
| Single-page frontend | `src/`, `public/` | React 16, React Router, Bootstrap, Material-UI, Recharts |
| REST API | `backend/` | Node, Express, MySQL, Passport (JWT) |
| Scrapers | `backend/*_scraper.js`, `scrape/` | Puppeteer |

```
Browser ──HTTPS──> React dev server (:3000)
   │
   └────HTTPS─────> Express API (:9001) ──> MySQL
                          │
                          └──> Puppeteer scrapers ──> college data sources
```

The API is HTTPS-only. Requests carry two independent credentials:

- **`x-key` header** — a shared value from `backend/config.json`. A deployment
  gate that keeps stray clients off the API. It is *not* an authentication
  control: the frontend ships it inside a browser bundle, so its users can read
  it.
- **`Authorization: JWT <token>`** — issued at login, signed with HS256, valid
  for 12 hours. Authorization derives from this. Every token is checked against
  a `LoggedIn` row holding a random per-session value, so logging out revokes a
  token that has not yet expired.

Note that `frontend/` holds an earlier static HTML prototype. It is not part of
the running application; `src/` superseded it.

## Prerequisites

- **Node.js 18 or newer** — `node --version`
- **MySQL 8** (or MariaDB 10.5+) — `mysql --version`
- **OpenSSL** — for generating the development certificate. Bundled with Git for
  Windows; preinstalled on macOS and most Linux distributions.

Puppeteer downloads its own Chromium build on install (roughly 150 MB). If you
do not intend to run the scrapers, skip it with
`PUPPETEER_SKIP_DOWNLOAD=true npm install`.

## Setup

### 1. Install dependencies

```bash
npm install && npm --prefix backend install
```

### 2. Create the database

```bash
mysql -u root -p < schema.sql
```

This creates the `c4me` database and its eight tables. Re-running it is safe;
every statement is guarded with `IF NOT EXISTS`.

Then create a dedicated account for the application rather than pointing it at
`root`:

```sql
CREATE USER 'c4me'@'localhost' IDENTIFIED BY 'a-strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON c4me.* TO 'c4me'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Generate a TLS certificate

```bash
sh ssl/generate-cert.sh
```

Writes `ssl/server.key` and `ssl/server.cert`, both gitignored. This is a
self-signed development certificate — your browser will warn about it the first
time, and you will need to accept it before the frontend can reach the API. Use
a CA-issued certificate in production.

### 4. Configure the backend

```bash
cp backend/config.example.json backend/config.json
```

Fill it in. `secret` and `keys` must be real random values — the server refuses
to start on the placeholders, and it has no built-in fallbacks, because a
default that ships in a repository is a publicly known default.

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

| Field | Meaning |
| --- | --- |
| `host`, `user`, `pass`, `db` | MySQL connection |
| `sslPort` | Port the HTTPS API listens on (example config uses 9001) |
| `secret` | JWT signing key. At least 32 characters of random data |
| `keys` | Array of accepted `x-key` values, each at least 16 characters |
| `allowedOrigins` | Exact origins permitted to make cross-origin calls, e.g. `["https://localhost:3000"]` |
| `collegedatasite`, `collegeranksite` | Scraper source URLs |

### 5. Configure the frontend

```bash
cp .env.example .env.local
```

Set `REACT_APP_API_URL` to your API's address and `REACT_APP_API_KEY` to one of
the values in `keys`. Everything in this file is compiled into the browser
bundle, so nothing secret belongs here.

## Running

Two servers, in separate terminals:

```bash
npm --prefix backend start
```

```bash
npm start
```

The API listens on `https://localhost:<sslPort>`; the frontend opens at
`https://localhost:3000`.

### Creating an administrator

Registration through the UI only creates student accounts. Administrators are
made from the command line:

```bash
node backend/createAdminAccount.js <username>
```

The password is read from stdin with echo suppressed. Do not pass it as an
argument — arguments are visible in the process list and recorded in shell
history.

## Loading data

A fresh database has no colleges in it. Sign in as an administrator and use the
admin page, which calls these endpoints in turn:

1. **College Scorecard** (`GET /ScrapeScoreCard`) — downloads the Department of
   Education's Most Recent Cohorts dataset and loads the schools named in
   `backend/colleges.txt`. Start here; it establishes the school rows.
2. **Rankings** (`GET /scrapeCollegeRank`) — adds a ranking to each school.
3. **Per-school detail** (`GET /scrapeCollegeData`) — adds average accepted GPA
   and the list of majors each school offers.

Scraping runs Puppeteer against live sites and takes a while.

Sample students and applications ship in `backend/students.csv` and
`backend/applications.csv` and load through `POST /importStudentTestData`. These
are synthetic course fixtures, not real records. `backend/insertApplications.js`
does the same bulk load without a running server.

## API reference

All routes require the `x-key` header. All except `POST /user` and `PUT /login`
also require `Authorization: JWT <token>`. The **Role** column is the account
type the token must carry.

### Authentication

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `PUT` | `/login` | — | Exchange username and password for a token |
| `PUT` | `/logout` | any | Revoke the current session |
| `GET` | `/validate` | any | Return the caller's id and type |
| `POST` | `/user` | — | Register a student account |

`/login` and `/user` are rate limited to 10 requests per 15 minutes per client.

### Students

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/me` | Student | Own profile |
| `GET` | `/student?id=` | any | Another student's profile |
| `PUT` | `/student` | Student | Update own profile |
| `POST` | `/profileImage` | Student | Upload a profile image (JPEG or PNG, 5 MB max) |
| `GET` | `/profileImage?id=` | any | Fetch a profile image |

Changing a password, email address or username on `PUT /student` requires the
current password in `old_pass`. Other fields do not.

### Schools and high schools

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/search` | any | Search schools. `type=s` strict, `type=l` lax |
| `GET` | `/search/rank` | Student | Rank school ids against the caller's profile |
| `GET` | `/school?id=` | any | One school |
| `GET` | `/schoolList` | any | Every school |
| `GET` | `/majorsList` | any | Distinct majors |
| `GET` | `/hsList` | any | Every high school |
| `GET` | `/highschoolByName?name=` | any | High school by exact name |
| `GET` | `/similarHS` | any | High schools similar to `name`/`city`/`state` |
| `GET` | `/autocomplete?type=&text=` | any | Name completion. `s` school, `h` high school, `m` major |

### Applications

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `POST` | `/application` | Student | Create or replace an application |
| `PUT` | `/application` | Student | Update a status |
| `GET` | `/myApplications` | Student | Own applications |
| `GET` | `/schoolApplications` | Student | Applications to a school, for the scatter plot |
| `DELETE` | `/application` | Admin | Delete an application |
| `GET` | `/application/questionablelist` | Admin | Flagged applications |
| `GET` | `/application/questionablelistAllData` | Admin | Flagged applications with full profiles |
| `PUT` | `/application/validate` | Admin | Clear a flag |

### Administration

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `GET` | `/ScrapeScoreCard` | Admin | Load College Scorecard data |
| `GET` | `/scrapeCollegeRank` | Admin | Scrape rankings |
| `GET` | `/scrapeCollegeData` | Admin | Scrape per-school detail and majors |
| `POST` | `/importStudentData` | Admin | Load students.csv |
| `POST` | `/importApplicationData` | Admin | Load applications.csv |
| `POST` | `/importStudentTestData` | Admin | Load both |
| `DELETE` | `/deleteAllStudents` | Admin | Delete every student and application |

## Project layout

```
├── schema.sql              Database schema
├── src/                    React application
│   ├── backend.js          Configured axios client
│   ├── pages/              Route components
│   └── routes/             Role-gated route wrappers
├── backend/
│   ├── app.js              Express setup, middleware, route table
│   ├── user.js             Registration, login, JWT strategy
│   ├── student.js          Profiles and profile images
│   ├── school.js           Search and ranking
│   ├── application.js      Applications and questionable-flag logic
│   ├── high_school.js      High school lookup and similarity
│   ├── admin.js            Imports and scrape orchestration
│   ├── *_scraper.js        Puppeteer scrapers
│   └── config.example.json Configuration template
├── ssl/generate-cert.sh    Development certificate generator
└── frontend/               Superseded static prototype, not in use
```

## Security

### The committed private key

`ssl/server.key` was committed to this repository in 2020 and was publicly
readable on GitHub. **That key is compromised and must never be used again.** It
has been removed from the working tree and purged from every commit in this
branch's history, but a rewrite here does not retract what was already
published: the key remains in clones, forks and caches made before the rewrite.
`ssl/generate-cert.sh` issues a fresh pair. If any certificate was ever issued
against the old key by a real CA, revoke it.

### Handling secrets

`backend/config.json` and `.env.local` are gitignored and hold every secret. The
server validates `secret` and `keys` at startup and exits if they are missing,
too short, or still set to the example placeholders — it will not fall back to a
default, so a misconfigured deployment fails loudly instead of running on a
value anyone can read in this repository.

### What protects a request

- **Transport** — HTTPS only. The plaintext listener that once served the same
  authenticated API on a second port is gone.
- **Origin** — CORS is an allowlist read from `allowedOrigins`.
- **Headers** — `helmet` sets CSP, HSTS, `X-Content-Type-Options` and frame
  options.
- **Sessions** — tokens are signed HS256, expire after 12 hours, and are checked
  against a server-side `LoggedIn` row so logout revokes them immediately. The
  browser stores the token in a `secure`, `sameSite=strict` cookie.
- **Passwords** — bcrypt at cost 12. Changing a password, email or username
  requires the current password.
- **Input** — every request is validated with a joi schema, and every SQL
  statement binds its values as parameters rather than building statements by
  string concatenation.
- **Rate limiting** — 10 requests per 15 minutes to the credential endpoints,
  1000 to everything else.

### Reporting

Open a private security advisory on the repository rather than a public issue.
