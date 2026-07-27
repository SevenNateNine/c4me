let joi = require('joi');
let bcrypt = require('bcrypt');
let crypto = require('crypto');
let JwtStrat = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;
let jwt = require('jsonwebtoken');

// bcrypt stores the cost factor inside the hash, so raising this does not
// invalidate existing accounts — they keep verifying at the cost they were
// created with and get upgraded the next time the password changes.
const saltRounds = 12;

// How long a session token stays valid. The random_val row in LoggedIn is still
// the authority for revocation; this bounds the damage from a stolen token that
// never gets logged out.
const TOKEN_LIFETIME = '12h';

// Passwords are parameterized into SQL like every other value, so this pattern
// is a password policy rather than an injection defence. Anchored at both ends —
// the original /^[^' ]*/ matched the empty prefix of any string and rejected
// nothing at all.
const passwordPattern = /^[^' ]+$/;

const newAccountSchema = joi.object({
  name: joi.string().min(3).max(50).pattern(/^[^' ]+$/).required(),
  pass: joi.string().min(8).max(50).pattern(passwordPattern).required(),
  first_name: joi.string().max(50).token().required(),
  last_name: joi.string().max(50).token().required(),
  email: joi.string().max(255).email().required()
});

exports.passwordHash = (pass, func) => {
  return hash(pass, func);
}

function hash(pass, func) {
  return bcrypt.hash(pass, saltRounds, (err, hash) => {
    return func(err, hash);
  });
}

exports.passwordHashSync = (pass) => {
  let salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(pass, salt);
}

exports.createAccount = (con, req, res) => {
  const {error} = newAccountSchema.validate(req.body);
  if (error) {
    res.status(400).send({error: 'invalid account details'});
    return;
  }
  hash(req.body.pass, (err, hashed) => {
    if (err) {
      console.error('hash failed:', err.message);
      res.sendStatus(500);
      return;
    }
    const query = `INSERT INTO User (user_name, password, type, first_name, last_name, email)
      VALUES (?, ?, 'Student', ?, ?, ?)`;
    const values = [req.body.name, hashed, req.body.first_name, req.body.last_name, req.body.email];
    con(query, values, (e, rows) => {
      if (e) {
        // Includes the duplicate-username case. The driver error names tables
        // and constraints, so it stays in the log rather than the response.
        console.error('account creation failed:', e.code);
        res.sendStatus(400);
        return;
      }
      con('INSERT INTO Student (id) VALUES (?)', [rows.insertId], (studentErr) => {
        if (studentErr) {
          console.error('student row creation failed:', studentErr.code);
        }
      });
      res.sendStatus(200);
    });
  });
}

const newAccountSchema2 = joi.object({
  name: joi.string().min(3).max(50).pattern(/^[^' ]+$/).required(),
  pass: joi.string().min(8).max(50).pattern(passwordPattern).required(),
  first_name: joi.string().max(50).token(),
  last_name: joi.string().max(50).token(),
  email: joi.string().max(255).email()
});

exports.createAdmin = (con, data, done) => {
  const callback = done || (() => {});
  const {error} = newAccountSchema2.validate(data);
  if (error) {
    callback(new Error(`invalid admin details: ${error.message}`));
    return;
  }
  hash(data.pass, (err, hashed) => {
    if (err) {
      callback(err);
      return;
    }
    const query = `INSERT INTO User (user_name, password, type, first_name, last_name, email)
      VALUES (?, ?, 'Admin', ?, ?, ?)`;
    const values = [data.name, hashed, data.first_name || null, data.last_name || null, data.email || null];
    con(query, values, (e, rows) => {
      if (e) {
        callback(e);
        return;
      }
      con('INSERT INTO Admin (id) VALUES (?)', [rows.insertId], (adminErr) => {
        if (adminErr) {
          callback(adminErr);
          return;
        }
        callback(null, rows.insertId);
      });
    });
  });
}

const loginSchema = joi.object({
  name: joi.string().max(50).pattern(/^[^' ]+$/).required(),
  pass: joi.string().max(50).pattern(passwordPattern).required(),
});

exports.login = (con, req, res, passport, secret) => {
  const {error} = loginSchema.validate(req.body);
  if (error) {
    // Same shape as a wrong password: a distinguishable "malformed" response
    // tells an attacker which usernames are worth trying.
    res.status(401).send({success: false});
    return;
  }
  con('SELECT id, type, password FROM User WHERE user_name = ?', [req.body.name], (dbError, rows) => {
    if (dbError || !rows || !rows[0]) {
      res.status(401).send({success: false});
      return;
    }
    bcrypt.compare(req.body.pass, rows[0].password, (err, result) => {
      if (err || !result) {
        res.status(401).send({success: false});
        return;
      }
      // Session nonce. Math.random() is not a CSPRNG — its output is predictable
      // from previous values, which would let an attacker forge the random_val
      // half of a session record.
      const rand = crypto.randomInt(1, 2147483647);
      con('REPLACE INTO LoggedIn (id, random_val) VALUES (?, ?)', [rows[0].id, rand], (e) => {
        if (e) {
          console.error('session creation failed:', e.code);
          res.status(401).send({success: false});
          return;
        }
        // Signed as an object rather than a JSON string so jsonwebtoken can
        // attach iat/exp; a string payload silently ignores expiresIn.
        const token = jwt.sign(
          {id: rows[0].id, type: rows[0].type, random_val: rand},
          secret,
          {expiresIn: TOKEN_LIFETIME, algorithm: 'HS256'}
        );
        res.status(200).send({success: true, type: rows[0].type, token: `JWT ${token}`});
      });
    });
  });
}

exports.logout = (con, req, res, id, random_val) => {
  con('DELETE FROM LoggedIn WHERE id = ? AND random_val = ?', [id, random_val], (err) => {
    if (err) {
      console.error('logout failed:', err.code);
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  });
}

exports.passportSetup = (con, passport, secret) => {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
  opts.secretOrKey = secret;
  // Pin the algorithm. Without this the token's own alg header chooses the
  // verifier, which is the standard route to a signature bypass.
  opts.algorithms = ['HS256'];
  passport.use(new JwtStrat(opts, (jwt_payload, done) => {
    // The payload is attacker-supplied data that happens to be signed, so it is
    // bound as parameters like any other untrusted input rather than pasted
    // into the SQL text.
    const query = `SELECT User.id as id, User.type as type
      FROM LoggedIn, User
      WHERE User.id = LoggedIn.id AND LoggedIn.id = ? AND random_val = ?`;
    con(query, [jwt_payload.id, jwt_payload.random_val], (err, rows) => {
      if (err) {
        return done(err, false);
      }
      // `rows == []` is never true in JavaScript — every array compares unequal
      // to a fresh array literal — so an empty result used to fall through to
      // done(null, undefined) instead of a clean failure.
      if (!rows || rows.length === 0) {
        return done(null, false);
      }
      return done(null, rows[0]);
    });
  }));
}
