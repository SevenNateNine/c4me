let joi = require('@hapi/joi');
let mysql = require('mysql');
let user = require('./user.js');
let bcrypt = require('bcrypt');
const studentUpdateSchema = joi.object({
  //user stuff
  user_name: joi.string().max(50).token().allow(null),
  first_name: joi.string().max(50).token().allow(null),
  last_name: joi.string().max(50).token().allow(null),
  email: joi.string().max(255).email().allow(null),
  pass: joi.string().max(255).pattern(/^[^' ]*/).allow(null),
  old_pass: joi.string().max(255).pattern(/^[^' ]*/).allow(null),
  hs_name: joi.string().max(255).pattern(/^[^']*/).allow(null),
  financial_status: joi.number().integer().allow(null), // this needs more but I don't know what it's meant to repressent
  major1: joi.string().max(255).pattern(/^[^']*/).allow(null),
  major2: joi.string().max(255).pattern(/^[^']*/).allow(null),
  grad_year: joi.number().integer().min(2000).allow(null),
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
  numAPs: joi.number().integer().min(0).allow(null),
  gpa : joi.number().min(0).max(4).allow(null)
});

exports.getProfile = (con, req, res) => {  
  if (joi.number().integer().validate(req.query.id).error) {
    return {satus: 400, value: {}};
  }
  console.log(`student request id: ${req.query.id}`);
  const query =mysql.format('SELECT User.user_name, User.first_name, User.last_name, User.email, Student.*, HighSchool.name as hs_name FROM User, Student LEFT JOIN HighSchool ON Student.hs_id = HighSchool.id WHERE Student.id = User.id AND User.id = ?',[req.query.id]);
  con(query, (err, rows) =>{
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(rows);
    }
  });
}

exports.getMyProfile = (con, req, res, id) => {
  console.log(`student request id: ${id}`);
  const query =mysql.format('SELECT User.user_name, User.first_name, User.last_name, User.email, Student.*, HighSchool.name as hs_name FROM User, Student LEFT JOIN HighSchool ON Student.hs_id = HighSchool.id WHERE Student.id = User.id AND User.id = ?',[id]);
  con(query, (err, rows) =>{
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(rows);
    }
  });
}

function passwordHelper(con, id, res, pass, func) {
  if (!pass) {
    func();
  } else {
    con(`SELECT * FROM User WHERE id = ${mysql.escape(id)}`, (error, rows) => {
      if (error || !rows[0]) {
        res.status(401).send(error);
        return;
      }
      console.log(rows[0].password);
      bcrypt.compare(pass, rows[0].password, (err, result) => {
        if (!err && result){
          func();
        } else { 
          res.sendStatus(401);
          return;
        }
      });
    });
  }
}

exports.editProfile = (con, req, res, id) => {
  
  if (joi.number().integer().validate(id).error) {
    res.sendStatus(400);
    return;
  }
  const {error, value} = studentUpdateSchema.validate(req.body);
  if (error) {
    res.status(400).send(error);
    return;
  }

  passwordHelper(con, id, res, req.body.old_pass, () => {
    var hs_name = req.body.hs_name ? req.body.hs_name.replace(/_/g,' ') : null;
    var major1 = req.body.major1 ? req.body.major1.replace(/_/g,' ') : null;
    var major2 = req.body.major2 ? req.body.major2.replace(/_/g,' ') : null;

    let query = `UPDATE Student S, User U SET`
    if (req.body.user_name) query += ` U.user_name = ${mysql.escape(req.body.user_name)},`
    if (req.body.first_name)  query += ` U.first_name = ${mysql.escape(req.body.first_name)},`
    if (req.body.last_name)  query += ` U.last_name = ${mysql.escape(req.body.last_name)},`
    if (req.body.email)  query += ` U.email = ${mysql.escape(req.body.email)},`
    if (req.body.pass)  query += ` U.password = ${mysql.escape(user.passwordHashSync(req.body.pass))},`
    if (req.body.hs_name)  query += ` S.hs_id = (SELECT id FROM HighSchool Where Name = ${mysql.escape(hs_name)} LIMIT 1),`
    if (req.body.financial_status)  query += ` S.financial_status = ${req.body.financial_status},`
    if (req.body.major1)  query += ` S.major1 = ${mysql.escape(major1)},`
    if (req.body.major2)  query += ` S.major2 = ${mysql.escape(major2)},`
    if (req.body.grad_year)  query += ` S.grad_year = ${req.body.grad_year},`
    if (req.body.sat_math)  query += ` S.sat_math = ${req.body.sat_math},`
    if (req.body.sat_ebrw)  query += ` S.sat_ebrw = ${req.body.sat_ebrw},`
    if (req.body.act_eng)  query += ` S.act_eng = ${req.body.act_eng},`
    if (req.body.act_math)  query += ` S.act_math = ${req.body.act_math},`
    if (req.body.act_reading)  query += ` S.act_reading = ${req.body.act_reading},`
    if (req.body.act_science)  query += ` S.act_science = ${req.body.act_science},`
    if (req.body.act_comp)  query += ` S.act_comp = ${req.body.act_comp},`
    if (req.body.sat_lit)  query += ` S.sat_lit = ${req.body.sat_lit},`
    if (req.body.sat_us) query += ` S.sat_us = ${req.body.sat_us},`
    if (req.body.sat_mathI)  query += ` S.sat_mathI = ${req.body.sat_mathI},`
    if (req.body.sat_mathII)  query += ` S.sat_mathII = ${req.body.sat_mathII},`
    if (req.body.sat_eco)  query += ` S.sat_eco = ${req.body.sat_eco},`
    if (req.body.sat_mol)  query += ` S.sat_mol = ${req.body.sat_mol},`
    if (req.body.sat_chem)  query += ` S.sat_chem = ${req.body.sat_chem},`
    if (req.body.sat_phy)  query += ` S.sat_phy = ${req.body.sat_phy},`
    if (req.body.numAPs)  query += ` S.numAPs = ${req.body.numAPs},`
    if (req.body.gpa)  query += ` S.gpa = ${req.body.gpa},`

    query = query.substring(0, query.length - 1);
    query += ` WHERE U.id = ${id} AND S.id = ${id}`;
    console.log(query);
    con(query, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
        return;
      }
      console.log(`student updated at id ${id}`);
      res.sendStatus(200);
    });
  });
}

exports.setProfileImage = (req, res, id) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.sendStatus(400);
  } else {
    let file = req.files[0];
    file.mv(`./media/profiles/profile${id}.jpg`, (err) => {
      if (err) {
        return res.sendStatus(500);
      } else {
        res.sendStatus(200);
      }
    });
  }
}

exports.getProfileImage = (req, res) => {
  const {err, value} = joi.number().integer().positive().validate(req.query.id);
  if (err) {
    res.sendStatus(400);
  }
  res.sendFile(`./media/profiles/profile${req.query.id}.jpg`, (error) => {
    if (error) {
      res.sendStatus(500);
    }
  });
}


