# Security

Reporting: open a private security advisory on the repository rather than a
public issue.

The current protections are described in the [README](README.md#security). This
file records what was found and fixed in the hardening pass, so the reasoning
behind those choices is not lost.

## Exposed key material

**A TLS private key was committed to a public repository.** `ssl/server.key` was
readable on GitHub from 2020. It has been removed from the working tree and
purged from every commit reachable from this branch, but publication cannot be
undone — the key survives in any clone, fork or cache made beforehand. **Treat it
as compromised permanently.** Generate a replacement with `ssl/generate-cert.sh`,
and revoke any CA-issued certificate ever bound to it.

Purging history rewrote every commit hash. Collaborators must re-clone rather
than merge.

Alongside it, the repository shipped a working JWT signing secret and API key as
*fallback defaults* in `app.js`. A default committed to a repository is a
publicly known default: any deployment that forgot to override it was signing
tokens an outsider could forge. The fallbacks are gone, and the server now exits
at startup if `secret` or `keys` are absent, too short, or left at their example
values.

## Injection

Every SQL statement now binds its values as parameters. Previously the codebase
built statements by string concatenation throughout, guarded inconsistently:

- `high_school.js` interpolated a request query parameter straight into a
  `WHERE` clause with no escaping at all.
- The passport JWT strategy interpolated the token payload into its lookup. A
  signed token is still attacker-authored data, and with the publicly known
  fallback secret it was also attacker-signable.
- The CSV importers and scrapers pasted third-party field values — College
  Scorecard rows, scraped page text, operator-supplied student CSVs — directly
  into `INSERT` statements.

Elsewhere `mysql.escape` was applied correctly, but a query builder that
concatenates is one schema edit away from being injectable again, so the
builders were converted wholesale rather than audited in place.

## Authentication and authorization

- **Password changes did not verify the old password.** The helper meant to
  check it called straight through to the update whenever `old_pass` was absent.
  Any stolen token converted into permanent account ownership. Changing a
  password, email or username now requires the current password — compared
  against the stored value, so an unrelated profile edit is unaffected.
- **`DELETE /application` accepted any authenticated role** while taking the
  target student from the request body, letting any student delete any other
  student's records. It is now administrator-only.
- **Tokens never expired.** They now carry a 12-hour expiry, and the strategy
  pins HS256 so the token's own header cannot select the verifier.
- **Session nonces came from `Math.random()`**, which is predictable from prior
  output. They now come from `crypto.randomInt`.
- Credential endpoints are rate limited to 10 requests per 15 minutes.
- The session cookie is now `secure` and `sameSite=strict`.

## Transport and origin

- **The API served itself twice: once over TLS and once in plaintext on a second
  port.** Every password and token sent to the plaintext listener crossed the
  network in the clear regardless of the TLS server beside it. The plaintext
  listener is gone.
- **`app.use(cors())` reflected any origin**, allowing any site on the internet
  to make credentialed requests. CORS is now an allowlist.
- **The frontend HTTP client set `rejectUnauthorized: false`**, accepting any
  certificate from any server and discarding the guarantee HTTPS provides.
  Removed; trust the development certificate locally instead.
- `helmet` now sets CSP, HSTS, `X-Content-Type-Options` and frame options.
- The API-key check moved from a per-route opt-in to global middleware, so a new
  route is closed by default rather than open until someone remembers it.

## Files and process integrity

- **The profile-image handler destructured joi's result as `{err, value}`.** Joi
  returns `{error, value}`, so the check never fired and an unvalidated id
  reached a filesystem path. Ids are validated and paths resolved absolutely.
- Uploads are capped at 5 MB, restricted to JPEG and PNG, and named from the
  authenticated user's id rather than anything the client supplies.
- Several handlers sent raw driver errors to the client, disclosing table names,
  column names and SQL text. They now log server-side and return a status.
- Tokens, `Authorization` headers and full SQL statements were being written to
  the console. Removed.
- Undefined-variable references in the logout, `similarHS` and application-import
  paths threw `ReferenceError` out of the handler, killing the process — a
  denial of service reachable without valid credentials. `GET /search/rank`
  dereferenced a parameter it never required, with the same effect.
- The scrapers leaked a Chromium process on every failure; browser teardown is
  now guaranteed.

## Dependencies

`npm audit` reported 28 vulnerabilities in the backend, 2 critical and 17 high,
including arbitrary file overwrite in `express-fileupload`, key-confusion in
`jsonwebtoken`, and prototype pollution in `minimist`. All are resolved. The
unmaintained `mysql` and `@hapi/joi` packages were replaced by `mysql2` and
`joi`, and the unused `csv-reader` dropped.

## Schema

The shipped schema could not run the application and had a defect of its own:
`User.password` was `VARCHAR(50)` while bcrypt emits 60 characters, silently
truncating every stored hash. It also omitted the `Applications` and `LoggedIn`
tables the code requires, and lacked the unique index on `School.name` that the
scrapers' upserts depend on. Replaced by `schema.sql`.

## Still open

- **No CSRF tokens.** The API is same-origin-restricted and takes its
  credential from an `Authorization` header rather than an ambient cookie, which
  covers the usual attack, but a token-based defence would be stronger.
- **The session cookie is readable by JavaScript**, because the frontend reads it
  to build the `Authorization` header. Making it `httpOnly` requires moving to
  cookie-based auth on the server.
- **`GET /student?id=` exposes any student's email** to any authenticated user.
  That may be intended for a profile-browsing feature, but it is worth deciding
  deliberately.
- **No automated tests.** Nothing here is covered by a regression test.
