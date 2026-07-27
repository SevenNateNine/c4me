let joi = require('joi');
let path = require('path');
let fs = require('fs');
let bcrypt = require('bcrypt');
let user = require('./user.js');

const MEDIA_DIR = path.join(__dirname, 'media', 'profiles');

const studentUpdateSchema = joi.object({
  //user stuff
  user_name: joi.string().max(50).token().allow(null),
  first_name: joi.string().max(50).token().allow(null),
  last_name: joi.string().max(50).token().allow(null),
  email: joi.string().max(255).email().allow(null),
  pass: joi.string().min(8).max(50).pattern(/^[^' ]+$/).allow(null),
  old_pass: joi.string().max(50).allow(null),
  hs_name: joi.string().max(255).allow(null),
  financial_status: joi.number().integer().allow(null), // this needs more but I don't know what it's meant to repressent
  major1: joi.string().max(255).allow(null),
  major2: joi.string().max(255).allow(null),
  grad_year: joi.number().integer().min(2000).max(2100).allow(null),
  sat_math: joi.number().integer().min(200).max(800).allow(null),
  sat_ebrw: joi.number().integer().min(200).max(800).allow(null),
  act_eng: joi.number().integer().min(1).max(36).allow(null),
  act_math: joi.number().integer().min(1).max(36).allow(null),
  act_reading: joi.number().integer().min(1).max(36).allow(null),
  act_science: joi.number().integer().min(1).max(36).allow(null),
  act_comp: joi.number().integer().min(1).max(36).allow(null),
  sat_lit: joi.number().integer().min(200).max(800).allow(null),
  sat_us: joi.number().integer().min(200).max(800).allow(null),
  sat_mathI: joi.number().integer().min(200).max(800).allow(null),
  sat_mathII: joi.number().integer().min(200).max(800).allow(null),
  sat_eco: joi.number().integer().min(200).max(800).allow(null),
  sat_mol: joi.number().integer().min(200).max(800).allow(null),
  sat_chem: joi.number().integer().min(200).max(800).allow(null),
  sat_phy: joi.number().integer().min(200).max(800).allow(null),
  numAPs: joi.number().integer().min(0).max(50).allow(null),
  gpa: joi.number().min(0).max(4).allow(null)
});

// Student columns that map straight through to a bound parameter.
const STUDENT_NUMERIC_FIELDS = [
  'financial_status', 'grad_year', 'sat_math', 'sat_ebrw', 'act_eng', 'act_math',
  'act_reading', 'act_science', 'act_comp', 'sat_lit', 'sat_us', 'sat_mathI',
  'sat_mathII', 'sat_eco', 'sat_mol', 'sat_chem', 'sat_phy', 'numAPs', 'gpa'
];

// Changing any of these is an identity change: it is how an attacker holding a
// stolen token converts temporary access into permanent ownership of the
// account. Each one requires the current password.
const REAUTH_FIELDS = ['pass', 'email', 'user_name'];

const profileQuery = `SELECT User.user_name, User.first_name, User.last_name, User.email,
  Student.*, HighSchool.name as hs_name
  FROM User, Student LEFT JOIN HighSchool ON Student.hs_id = HighSchool.id
  WHERE Student.id = User.id AND User.id = ?`;

exports.getProfile = (con, req, res) => {
  const {error} = joi.number().integer().positive().required().validate(req.query.id);
  if (error) {
    // The original returned a plain object here instead of answering the
    // request, so a bad id left the connection hanging until it timed out.
    res.sendStatus(400);
    return;
  }
  con(profileQuery, [req.query.id], (err, rows) => {
    if (err) {
      console.error('getProfile failed:', err.code);
      res.sendStatus(500);
      return;
    }
    res.status(200).send(rows);
  });
}

exports.getMyProfile = (con, req, res, id) => {
  con(profileQuery, [id], (err, rows) => {
    if (err) {
      console.error('getMyProfile failed:', err.code);
      res.sendStatus(500);
      return;
    }
    res.status(200).send(rows);
  });
}

// True when the request would actually change an identity field. The edit form
// reloads the profile and posts every field back on each save, so testing
// merely for presence would demand the password on an unrelated GPA edit.
// Only a real change to the stored value counts.
function changesIdentity(body, current) {
  if (body.pass != null) return true;
  if (body.user_name != null && body.user_name !== current.user_name) return true;
  if (body.email != null && body.email !== current.email) return true;
  return false;
}

exports.editProfile = (con, req, res, id) => {
  if (joi.number().integer().positive().validate(id).error) {
    res.sendStatus(400);
    return;
  }
  const {error} = studentUpdateSchema.validate(req.body);
  if (error) {
    res.status(400).send({error: 'invalid profile fields'});
    return;
  }

  con('SELECT user_name, email, password FROM User WHERE id = ?', [id], (dbErr, rows) => {
    if (dbErr || !rows || !rows[0]) {
      console.error('editProfile user lookup failed:', dbErr && dbErr.code);
      res.sendStatus(500);
      return;
    }
    const current = rows[0];

    if (!changesIdentity(req.body, current)) {
      applyProfileUpdate(con, req, res, id);
      return;
    }

    // The original passed old_pass to a helper that called straight through to
    // the update whenever old_pass was absent, so a password change never
    // actually required knowing the old one — a stolen token was enough to take
    // the account permanently.
    if (!req.body.old_pass) {
      res.status(401).send({error: `current password required to change ${REAUTH_FIELDS.join(', ')}`});
      return;
    }
    bcrypt.compare(req.body.old_pass, current.password, (compareErr, ok) => {
      if (compareErr || ok !== true) {
        res.sendStatus(401);
        return;
      }
      applyProfileUpdate(con, req, res, id);
    });
  });
}

function applyProfileUpdate(con, req, res, id) {
  const sets = [];
  const values = [];

  const addSet = (fragment, value) => {
    sets.push(fragment);
    values.push(value);
  };

  if (req.body.user_name != null) addSet('U.user_name = ?', req.body.user_name);
  if (req.body.first_name != null) addSet('U.first_name = ?', req.body.first_name);
  if (req.body.last_name != null) addSet('U.last_name = ?', req.body.last_name);
  if (req.body.email != null) addSet('U.email = ?', req.body.email);
  if (req.body.hs_name != null) {
    addSet('S.hs_id = (SELECT id FROM HighSchool WHERE Name = ? LIMIT 1)', req.body.hs_name.replace(/_/g, ' '));
  }
  if (req.body.major1 != null) addSet('S.major1 = ?', req.body.major1.replace(/_/g, ' '));
  if (req.body.major2 != null) addSet('S.major2 = ?', req.body.major2.replace(/_/g, ' '));
  for (const field of STUDENT_NUMERIC_FIELDS) {
    if (req.body[field] != null) addSet(`S.${field} = ?`, req.body[field]);
  }

  const finish = () => {
    if (sets.length === 0) {
      // With no fields set the original trimmed a trailing character off
      // "UPDATE Student S, User U SET" and sent the fragment to MySQL.
      res.status(400).send({error: 'no fields to update'});
      return;
    }
    const query = `UPDATE Student S, User U SET ${sets.join(', ')} WHERE U.id = ? AND S.id = ?`;
    con(query, values.concat([id, id]), (err) => {
      if (err) {
        console.error('editProfile failed:', err.code);
        res.sendStatus(400);
        return;
      }
      res.sendStatus(200);
    });
  };

  if (req.body.pass != null) {
    // Hashing asynchronously: bcrypt at cost 12 blocks for a few hundred
    // milliseconds, and the sync variant stalls every other request meanwhile.
    user.passwordHash(req.body.pass, (err, hashed) => {
      if (err) {
        console.error('password hash failed:', err.message);
        res.sendStatus(500);
        return;
      }
      addSet('U.password = ?', hashed);
      finish();
    });
    return;
  }
  finish();
}

const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': true,
  'image/png': true
};

exports.setProfileImage = (req, res, id) => {
  if (joi.number().integer().positive().validate(id).error) {
    res.sendStatus(400);
    return;
  }
  if (!req.files || Object.keys(req.files).length === 0) {
    res.sendStatus(400);
    return;
  }
  // express-fileupload exposes uploads keyed by field name, not as an array, so
  // req.files[0] was always undefined and .mv() on it threw.
  const file = req.files[Object.keys(req.files)[0]];
  if (!file || Array.isArray(file)) {
    res.sendStatus(400);
    return;
  }
  if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
    res.status(415).send({error: 'profile image must be image/jpeg or image/png'});
    return;
  }

  // The filename comes from the authenticated user's id, never from the
  // uploaded file's own name, so an upload cannot choose where it lands.
  const target = path.join(MEDIA_DIR, `profile${id}.jpg`);
  fs.mkdir(MEDIA_DIR, {recursive: true}, (mkdirErr) => {
    if (mkdirErr) {
      console.error('cannot create media directory:', mkdirErr.message);
      res.sendStatus(500);
      return;
    }
    file.mv(target, (err) => {
      if (err) {
        console.error('profile image write failed:', err.message);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
}

exports.getProfileImage = (req, res) => {
  // Destructured as {err, value} originally. Joi returns {error, value}, so
  // `err` was always undefined, the check never fired, and req.query.id went
  // unvalidated into the path below.
  const {error} = joi.number().integer().positive().required().validate(req.query.id);
  if (error) {
    res.sendStatus(400);
    return;
  }
  // Absolute path built from an integer. sendFile rejects relative paths
  // anyway, and path.join on an unvalidated id is how "../" escapes the
  // directory.
  const target = path.join(MEDIA_DIR, `profile${parseInt(req.query.id, 10)}.jpg`);
  res.sendFile(target, (sendErr) => {
    if (sendErr && !res.headersSent) {
      res.sendStatus(404);
    }
  });
}
