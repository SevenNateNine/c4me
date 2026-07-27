# Backend

The Node/Express API for c4me. Setup, configuration and the full route table
live in the [root README](../README.md); this file documents the request and
response shapes for each route.

`app.js` is the entry point: it loads configuration, installs middleware and
maps routes onto handlers. The handlers are split by domain across `user.js`,
`student.js`, `school.js`, `application.js`, `high_school.js` and `admin.js`.

## Conventions

Every route requires the `x-key` header. Every route except `POST /user` and
`PUT /login` also requires `Authorization: JWT <token>`.

Where a handler needs to know *which* student is acting, it takes the id from
the verified token — never from the request. A request body cannot name a
different student.

Failures return a status code and, at most, a short message. Database errors are
logged server-side and never returned, since driver errors carry table names,
column names and SQL text.

## Authentication

**`POST /user`** — register a student. All fields required.

```
name        string, 3-50 chars, no spaces or apostrophes
pass        string, 8-50 chars, no spaces or apostrophes
first_name  string, max 50, alphanumeric and underscore
last_name   string, max 50, alphanumeric and underscore
email       string, max 255, valid address
```

Accounts are always created as `Student`. There is deliberately no `type` field:
letting a registration request choose its own role would make administrator
access self-service. Use `createAdminAccount.js` instead.

**`PUT /login`** — `{name, pass}`. Returns `{success: true, type, token}` where
`token` is `"JWT <signed token>"`, or `{success: false}` with 401. Rate limited
to 10 attempts per 15 minutes.

**`PUT /logout`** — no body. Drops the session row, invalidating the token
before its 12-hour expiry.

**`GET /validate`** — returns `{id, type}` for the bearer, or 401.

## Students

**`GET /me`** — the caller's own profile.

**`GET /student?id=`** — another student's profile. `id` is a positive integer.

Both return an array holding one row: the `User` and `Student` columns joined
with the high school name.

**`PUT /student`** — update a profile. Every field is optional; omitted fields
are left alone.

```
user_name         string, max 50, alphanumeric and underscore
first_name        string, max 50, alphanumeric and underscore
last_name         string, max 50, alphanumeric and underscore
email             string, max 255, valid address
pass              string, 8-50, no spaces or apostrophes
old_pass          string, max 50
hs_name           string, max 255, underscores become spaces
financial_status  integer
major1, major2    string, max 255, underscores become spaces
grad_year         integer [2000, 2100]
sat_math          integer [200, 800]
sat_ebrw          integer [200, 800]
act_eng           integer [1, 36]
act_math          integer [1, 36]
act_reading       integer [1, 36]
act_science       integer [1, 36]
act_comp          integer [1, 36]
sat_lit           integer [200, 800]
sat_us            integer [200, 800]
sat_mathI         integer [200, 800]
sat_mathII        integer [200, 800]
sat_eco           integer [200, 800]
sat_mol           integer [200, 800]
sat_chem          integer [200, 800]
sat_phy           integer [200, 800]
numAPs            integer [0, 50]
gpa               float [0, 4]
```

Changing `pass`, `email` or `user_name` to a *different* value requires
`old_pass` to hold the account's current password; a request that changes only
scores or majors does not. Sending `email` unchanged does not trigger the
requirement, so the edit form can post the whole profile back on every save.

**`POST /profileImage`** — multipart upload, one file, JPEG or PNG, 5 MB
maximum. Stored against the caller's own id.

**`GET /profileImage?id=`** — returns the image, or 404.

## Schools

**`GET /search`** — all filters optional except `type`.

```
type            'l' lax or 's' strict; required
admission_low   integer [0, 100]
admission_high  integer [0, 100]
cost_low        float [0, 9999999]
cost_high       float [0, 9999999]
states          array of 2-letter codes
region          string, max 20
rank_low        integer, min 1
rank_high       integer, min 1
size_low        integer [0, 99999]
size_high       integer [0, 99999]
sat_math_low    integer [200, 800]
sat_math_high   integer [200, 800]
sat_ebrw_low    integer [200, 800]
sat_ebrw_high   integer [200, 800]
act_comp_low    integer [1, 36]
act_comp_high   integer [1, 36]
name            string, max 255, underscores become spaces
major1, major2  string, max 255
```

A strict search requires every supplied filter to match. A lax search also
admits schools whose value for that column is NULL.

**`GET /search/rank`** — `search` is a required array of 1 to 500 school ids.
Returns one object per school: `{id, result, major1, major2}`, where `result` is
the recommendation score and the two booleans report whether the school offers
the student's declared majors.

**`GET /school?id=`**, **`GET /schoolList`**, **`GET /majorsList`** — direct
lookups, no parameters beyond the id.

**`GET /autocomplete?type=&text=`** — `type` is `s` for colleges, `h` for high
schools, `m` for majors. `text` is at most 255 alphanumeric characters and is
matched as a substring. Returns `{id, name}` objects.

## High schools

**`GET /hsList`** — every high school.

**`GET /highschoolByName?name=`** — exact name match.

**`GET /similarHS`** — requires `name`, `city` and `state`. `name` and `city` are
alphanumeric with underscores; `state` is exactly two letters. These three are
concatenated into the scraper's target URL, so the character rules matter.

Returns objects of `{high_school, similarity_score, highlights}` sorted by score,
where `highlights` names the dimensions that matched closely: `sat`, `act`, `ap`,
`state`, `school`, `major`.

## Applications

**`POST /application`** and **`PUT /application`** — `{college_id, status}`. The
student is taken from the token. `status` is one of `Pending`, `Waitlisted`,
`Accepted`, `Rejected`, `Deferred`, `Withdrawn`.

**`GET /myApplications`** — the caller's applications with school names.

**`GET /schoolApplications`** — scatter plot data.

```
college_id  positive integer; required
hs_id       array of high school ids
class_low   integer [2000, 2100]
class_high  integer [2000, 2100]
statuses    array of status strings
```

**`DELETE /application`** — `{college_id, student_id}`. **Administrator only.**
The handler names the student in the body rather than taking it from the token,
so a student role here would let anyone delete anyone else's records.

**`PUT /application/validate`** — `{college_id, student_id}`. Clears the
questionable flag. Administrator only.

**`GET /application/questionablelist`** and
**`/application/questionablelistAllData`** — flagged applications, the second
with the full student and school columns joined in. Administrator only.

### How the questionable flag is set

On an accepted application, the student's numbers are compared against the
school's published lows. A GPA under 70% of the average accepted GPA, or a score
under 80% of the relevant range low, counts as one hit. Two or more hits flag the
application. If the student reported no GPA, or neither an SAT nor an ACT, or if
the school has no published ranges to compare against, the application is left
unflagged.

## Administration

All administrator-only. `ScrapeScoreCard`, `scrapeCollegeRank` and
`scrapeCollegeData` drive Puppeteer against live sources and take time to
return. `importStudentData`, `importApplicationData` and `importStudentTestData`
read the CSVs in this directory. `deleteAllStudents` removes every student and
application row.

## Notes

`GET /scrape/:src` used to be listed here. It was never implemented — it checked
the API key and then returned nothing, leaving the request open until it timed
out — and has been removed.
