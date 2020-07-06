let joi = require('@hapi/joi');
let mysql = require('mysql');
let bcrypt = require('bcrypt');
let JwtStrat = require('passport-jwt').Strategy;
let ExtractJwt = require('passport-jwt').ExtractJwt;
let jwt = require('jsonwebtoken');

const saltRounds = 10; //if you change this none of the existing accounts will work anymore

const newAccountSchema = joi.object({
  name: joi.string().min(3).max(50).pattern(/^[^' ]*/).required(),
  pass: joi.string().min(6).max(50).pattern(/^[^' ]*/).required(), //Disalows spaces and '. all other charicters should work
  first_name: joi.string().max(50).token().required(),            //should protect against sql injection attacks
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
  const {error, val} = newAccountSchema.validate(req.body);
  if (error) {
    res.status(400).send(error);
    return;
  }
  hash(req.body.pass, (err, hash) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    let query = `INSERT INTO User (user_name, password, type, first_name, last_name, email) VALUES (${mysql.escape(req.body.name)}, 
      ${mysql.escape(hash)}, 'Student', ${mysql.escape(req.body.first_name)}, 
      ${mysql.escape(req.body.last_name)}, ${mysql.escape(req.body.email)})`;
    console.log(query);
    con(query, (e, rows) => {
      if (e) {
        res.status(500).send(e);
        return;
      } else {
        con(`INSERT INTO Student (id) VALUES (${rows.insertId})`, (error, rows) =>{});
        res.sendStatus(200);
      }
    });
  });
}

const newAccountSchema2 = joi.object({
  name: joi.string().min(3).max(50).pattern(/^[^' ]/).required(),
  pass: joi.string().min(6).max(50).pattern(/^[^' ]*/).required(), //Disalows spaces and '. all other charicters should work
  first_name: joi.string().max(50).token(),            //should protect against sql injection attacks
  last_name: joi.string().max(50).token(),
  email: joi.string().max(255).email()
});
exports.createAdmin = (con, data) => {
  const {error, val} = newAccountSchema2.validate(data);
  if (error) {
    return 'Error: validate error';
  }
  hash(data.pass, (err, hash) => {
    if (err) {
      return 'Error: hash error';
    }
    let query = `INSERT INTO User (user_name, password, type, first_name, last_name, email) VALUES (${mysql.escape(data.name)}, 
      ${mysql.escape(hash)}, 'Admin', ${mysql.escape(data.first_name)}, 
      ${mysql.escape(data.last_name)}, ${mysql.escape(data.email)})`;
    console.log(query);
    con(query, (e, rows) => {
      if (e) {
        return 'Error: database error';
      } else {
        con(`INSERT INTO Admin (id) VALUES (${rows.insertId})`, (error, rows) =>{});
      }
    });
  });
}

const loginSchema = joi.object({ 
  name: joi.string().pattern(/^[^' ]/).required(),
  pass: joi.string().pattern(/^[^' ]/).required(),
});

exports.login = (con, req, res, passport, secret) => {
  const {error, val} = loginSchema.validate(req.body);
  if (error) {
    res.status(400).send(error);
    return;
  }
  con(`SELECT * FROM User WHERE user_name = ${mysql.escape(req.body.name)}`, (error, rows) => {
    if (error || !rows[0]) {
      res.status(401).send(error);
      return;
    }
    bcrypt.compare(req.body.pass, rows[0].password, (err, result) => {
      console.log(`result: ${result}`);
      console.log(`error: ${err}`);
      if (!err && result) {
        //incude passport jwt token
        console.log(rows);
        let rand = Math.floor(Math.random() * 2147483647);
        con(`REPLACE INTO LoggedIn (id, random_val) VALUES (${rows[0].id}, ${rand})`, (e, results) => {
          if (!e) {
            let temp = {id: rows[0].id, type: rows[0].type, random_val: rand};
            console.log(temp);
            let token = jwt.sign(JSON.stringify(temp), secret);
            console.log(token);
            res.status(200).send({success: true, type: rows[0].type,token: `JWT ${token}`});
          } else {
            console.log(e);
            res.status(401).send({success: false});
          }
        });
      }
      else {
        res.status(401).send({success: false});
      }
    });
  });
}

exports.logout = (con, req, res, id, random_val) => {
  con(`DELETE FROM LoggedIn WHERE id = ${id} AND random_val = ${random_val}`, (err, results) => {
    if (err) {
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
  passport.use(new JwtStrat(opts, (jwt_payload, done) => {
    con(`SELECT User.id as id, User.type as type FROM LoggedIn, User WHERE User.id = LoggedIn.id 
    AND LoggedIn.id = ${jwt_payload.id} 
    AND random_val = ${jwt_payload.random_val}`, (err, rows) => {
      if (err) {
        return done(err, false);
      } else if (rows == []){
        done(null, false);
      }else {
        done(null, rows[0]);
      }
    });
  }));
}
