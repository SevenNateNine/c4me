let mysql = require('mysql');
let joi = require('@hapi/joi');

const appSchema = joi.object({
    college_id: joi.number().integer().positive().required(),
    student_id: joi.number().integer().positive().required(),
    status: joi.string().valid('Pending', 'Waitlisted', 'Accepted', 'Rejected', 'Deferred', 'Withdrawn').required()
});


function flag(con, val, student_id, college_id) {
  if (val == true) {
    con(`UPDATE Applications SET questionable = true WHERE student_id = ${student_id} AND college_id = ${college_id}`, (err, r) =>{
      if (err){
        console.log(err)
      }
    });
  } else if (val == false) { 
    con(`UPDATE Applications SET questionable = false WHERE student_id = ${student_id} AND college_id = ${college_id}`, (err, r) =>{
      if (err){
        console.log(err)
      }
    });
  }
}

function calculateQuestionable(con, student_id, college_id, results) {
  
  con(`SELECT sat_math, sat_ebrw, act_comp, gpa FROM Student WHERE id = ${student_id}`, (e, r) => {
  if (e) {
    //again should not trigger in practice unless the db is down and then the
    //application can not be updated.
    console.log(e)
    } else {
    //the actual math here  
      if (!r[0].gpa || (!r[0].act_comp && (!r[0].sat_ebrw || !r[0].sat_math))) { 
        // if there's no gpa or the student took neither the ACT
        // nor SAT immediately flag as questionable 
        console.log('insufficent student data'); 
        flag(con, false, student_id, college_id);
      } else if (!r[0].act_comp) { // did not take ACT
        console.log("did not take ACT");
        if (r[0].gpa < .7 * results[0].average_accepted_gpa 
          || r[0].sat_math < .8 * results[0].sat_math_range_low 
          || r[0].sat_ebrw < .8 * results[0].sat_ebrw_range_low) {
          flag(con, true, student_id, college_id);
        } else {  
          flag(con, false, student_id, college_id);
        }
      } else if (!r[0].sat_ebrw || !r[0].sat_math) { //did not take SAT
        console.log("did not take SAT");
        if (r[0].gpa < .7 * results[0].average_accepted_gpa 
          || r[0].act_comp < .8 * results[0].act_range_low) {
          flag(con, true, student_id, college_id);
        } else {
          flag(con, false, student_id, college_id);
        }
      } else {
        //all data is supplied
        console.log("all data supplied");
        let hits = 0;
        hits = (r[0].gpa < .7 * results[0].average_accepted_gpa? 1 : 0) +
          (r[0].act_comp < .8 * results[0].act_range_low? 1: 0) + 
          (r[0].sat_math < .8 * results[0].sat_math_range_low? 1: 0) +
          (r[0].sat_ebrw < .8 * results[0].sat_ebrw_range_low? 1: 0);
        if (hits >= 2) {
          flag(con, true, student_id, college_id);
        } else {
          flag(con, false, student_id, college_id);
        }
      }
    }
  }); //I realy don't like doing it like this.
}

function handleAccepted(con, student_id, college_id) {
  
  con(`SELECT sat_math_range_low, sat_ebrw_range_low, act_range_low, avg_accepted_gpa FROM School WHERE id = ${college_id}`, (err, results) =>{
    if (err) {
      console.error(err);
    } else if (!results[0].sat_math_range_low || !results[0].sat_ebrw_range_low || !results[0].act_range_low || !results[0].avg_accepted_gpa) {
      // if for some resson the DB does not have the neccesary data, assume the app is not questionable
      console.log(results[0].sat_math_range_low)
      console.log('not enough college data')
      flag(con, false, student_id, college_id);
    }
    else {
      calculateQuestionable(con, student_id, college_id, results);
    }
  });
}

function flagQuestionableApp(con, student_id, college_id, status) {
  //implement questionable decision stuff here.
  //probably have to make two db request to get the data
  let q = false;
  if (status === 'Accepted') {
    console.log("new accepted application");
    handleAccepted(con, student_id, college_id);
  } else {
    flag(con, false, student_id, college_id);
  }
}

exports.insertApplication = (con, student_id, college_id, status) => {
  let query = `INSERT IGNORE INTO Applications (student_id, college_id, status) 
  VALUES (${student_id}, ${college_id}, ${mysql.escape(status)})`
  con(query, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
  });
  flagQuestionableApp(con ,student_id, college_id, status);
}

const appSchema2 = joi.object({
    college_id: joi.number().integer().positive().required(),
    status: joi.string().valid('Pending', 'Waitlisted', 'Accepted', 'Rejected', 'Deferred', 'Withdrawn').required()
});

exports.createApplication = (con, req, res, id) => {
  //this is where students create new applications
  //if the status is not pending it should be checked for questionable acceptance
  const {error, value} = appSchema2.validate(req.body);
  if (error) {    
    res.status(400).send(error);
    return;
  }
  let query = `INSERT INTO Applications (student_id, college_id, status) 
    VALUES (${id}, ${req.body.college_id}, ${mysql.escape(req.body.status)})
    ON DUPLICATE KEY UPDATE 
      student_id = VALUES(student_id), 
      college_id = VALUES(college_id), 
      status = VALUES(status)
  `
  console.log(query);

  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
      return;
    }
    res.send(data);
    flagQuestionableApp(con, id, req.body.college_id, req.body.status);
  });
}
exports.getUserApplications = (con, req, res, id) => {
  let query = `SELECT School.name as school_name, Applications.status as status, Applications.questionable as questionable FROM Applications, School
  WHERE Applications.college_id = School.id AND Applications.student_id = ${id}`;
  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    res.status(200).send(data);
  });
}
exports.updateApplication = (con, req, res, id) => {  
  //this is where students update applications
  //if the status is not pending it should be checked for questionable acceptance
  const {error, value} = appSchema2.validate(req.body);
  if (error) {    
    res.status(400).send(error);
    return;
  }
  let query = `UPDATE Applications SET status = ${mysql.escape(req.body.status)}
    WHERE student_id = ${id} AND college_id = ${req.body.college_id}` 

  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
      return;
    }
    res.send(data);
  });
  flagQuestionableApp(con, id, req.body.college_id, req.body.status);
}

exports.getQuestionable = (con, req, res) => {  
  //returns the list of questionable applications
  let query = `SELECT * FROM Applications WHERE questionable = true` 

  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
      return;
    }
    res.send(data);
  });
}


exports.getQuestionableAllData = (con, req, res) => {  
  //returns the list of questionable applications
  let query = `SELECT DISTINCT 
    User.user_name,
    Student.id as student_id,
    Student.hs_id as student_hs_id,
    (CASE WHEN Student.hs_id IS NOT NULL 
      THEN HighSchool.name 
    END) as high_school_name,
    Student.financial_status as student_financial_status,
    Student.major1 as student_major1,
    Student.major2 as student_major2,
    Student.grad_year as student_grad_year,
    Student.sat_math as student_sat_math,
    Student.sat_ebrw as student_sat_ebrw,
    Student.act_eng as student_act_eng,
    Student.act_math as student_act_math,
    Student.act_reading as student_act_reading,
    Student.act_science as student_act_science,
    Student.act_comp as student_act_comp,
    Student.sat_lit as student_sat_lit,
    Student.sat_us as student_sat_us,
    Student.sat_mathI as student_sat_mathI,
    Student.sat_mathII as student_sat_mathII,
    Student.sat_eco as student_sat_eco,
    Student.sat_mol as student_sat_mol,
    Student.sat_chem as student_sat_chem,
    Student.sat_phy as student_sat_phy,
    Student.numAPs as student_numAPs,
    Student.gpa as student_gpa,
    School.id as college_id, 
    School.name as school_name,
    School.city as school_city,
    School.state as school_state,
    School.region as school_region,
    School.admission_rate as school_admission_rate,
    School.cost as school_cost,
    School.ranking as school_ranking,
    School.size as school_size,
    School.act_composite as school_act_composite,
    School.sat_math as school_sat_math,
    School.sat_ebrw as school_sat_ebrw,
    School.sat_math_range_low as school_sat_math_range_low,
    School.sat_math_range_high as school_sat_math_range_high,
    School.sat_ebrw_range_low as school_sat_ebrw_range_low,
    School.sat_ebrw_range_high as school_sat_ebrw_range_high,
    School.act_range_low as school_act_range_low,
    School.act_range_high as school_act_range_high,
    School.avg_accepted_gpa as school_avg_accepted_gpa,
    Applications.status 
    FROM User, Student, School, Applications, HighSchool
    WHERE Applications.student_id = Student.id 
    AND Applications.college_id = School.id 
    AND Applications.questionable = true  
    AND User.id = Student.id 
    AND (HighSchool.id = Student.hs_id OR Student.hs_id IS NULL)` 

  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
      return;
    }
    res.send(data);
  });
}

const appSchema_validate = joi.object({
  college_id: joi.number().integer().positive().required(),
  student_id: joi.number().integer().positive().required(),
});

exports.validate = (con, req, res) => { 
  //removes the questionable tag from the given application
  const {error, value} = appSchema_validate.validate(req.body);
  if (error) {    
    res.status(400).send(error);
    console.log(error);
    return;
  }

  let query = `UPDATE Applications SET questionable = false WHERE student_id = ${req.body.student_id} AND college_id = ${req.body.college_id}` 

  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
      return;
    }
    res.send(data);
  });
}

exports.delete = (con, req, res) => { 
  //deletes the given application as it has been determined by the admin to be invalid
  const {error, value} = appSchema_validate.validate(req.body);
  if (error) {    
    res.status(400).send(error);
    return;
  }

  let query = `DELETE FROM Applications WHERE student_id = ${req.body.student_id} AND college_id = ${req.body.college_id}` 

  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
      return;
    }
    res.send(data);
  });
}

const applicationTrackerSchema = joi.object({
  college_id: joi.number().integer().positive().required(),
  hs_id: joi.array().items(joi.number().integer().positive()),
  class_high: joi.number().integer().min(2000),
  class_low: joi.number().integer().min(2000),
  statuses:joi.array().items(joi.string().valid('Pending', 'Waitlisted', 'Accepted', 'Rejected', 'Deferred', 'Withdrawn'))
});

exports.allApplicationsForSchool = (con, req, res) => {
  //returns all of the applications to a given school for use in the scatter plot
  const {error, value} = applicationTrackerSchema.validate(req.query);
  if (error) {    
    console.log("Joi is upset you've done this")
    res.status(400).send(error);
    return;
  }

  let query = `SELECT DISTINCT 
    User.user_name,
    Student.id as student_id,
    Student.hs_id as student_hs_id,
    (CASE WHEN Student.hs_id IS NOT NULL 
      THEN HighSchool.name 
    END) as high_school_name,
    Student.financial_status as student_financial_status,
    Student.major1 as student_major1,
    Student.major2 as student_major2,
    Student.grad_year as student_grad_year,
    Student.sat_math as student_sat_math,
    Student.sat_ebrw as student_sat_ebrw,
    Student.sat_math + Student.sat_ebrw as student_sat_comp,
    Student.act_eng as student_act_eng,
    Student.act_math as student_act_math,
    Student.act_reading as student_act_reading,
    Student.act_science as student_act_science,
    Student.act_comp as student_act_comp,
    Student.sat_lit as student_sat_lit,
    Student.sat_us as student_sat_us,
    Student.sat_mathI as student_sat_mathI,
    Student.sat_mathII as student_sat_mathII,
    Student.sat_eco as student_sat_eco,
    Student.sat_mol as student_sat_mol,
    Student.sat_chem as student_sat_chem,
    Student.sat_phy as student_sat_phy,
    (IFNULL(Student.sat_lit,0)/800)*5 + (IFNULL(Student.sat_us,0)/800)*5 + (IFNULL(Student.sat_mathI,0)/800)*5 +
    (IFNULL(Student.sat_mathII,0)/800)*5 + (IFNULL(Student.sat_eco,0)/800)*5 + (IFNULL(Student.sat_mol,0)/800)*5 +
    (IFNULL(Student.sat_chem,0)/800)*5 + (IFNULL(Student.sat_phy,0)/800)*5 + 
    (((IFNULL(Student.sat_math + Student.sat_ebrw,0)/1600) + (IFNULL(Student.act_comp,0)/36))/
    (IFNULL((Student.sat_math + Student.sat_ebrw)/(Student.sat_math + Student.sat_ebrw),0) + 
    IFNULL(Student.act_comp/Student.act_comp,0)))  * 
    (100 - (5 * (IFNULL(Student.sat_lit/Student.sat_lit,0) + IFNULL(Student.sat_us/Student.sat_us,0) + 
    IFNULL(Student.sat_mathI/Student.sat_mathI,0) + IFNULL(Student.sat_mathII/Student.sat_mathII,0) + 
    IFNULL(Student.sat_eco/Student.sat_eco,0) + IFNULL(Student.sat_mol/Student.sat_mol,0) + 
    IFNULL(Student.sat_chem/Student.sat_chem,0) + IFNULL(Student.sat_phy/Student.sat_phy,0)))) as student_test_composite, 
    Student.numAPs as student_numAPs,
    Student.gpa as student_gpa,
    School.id as college_id, 
    School.name as school_name,
    School.city as school_city,
    School.state as school_state,
    School.region as school_region,
    School.admission_rate as school_admission_rate,
    School.cost as school_cost,
    School.ranking as school_ranking,
    School.size as school_size,
    School.act_composite as school_act_composite,
    School.sat_math as school_sat_math,
    School.sat_ebrw as school_sat_ebrw,
    School.sat_math_range_low as school_sat_math_range_low,
    School.sat_math_range_high as school_sat_math_range_high,
    School.sat_ebrw_range_low as school_sat_ebrw_range_low,
    School.sat_ebrw_range_high as school_sat_ebrw_range_high,
    School.act_range_low as school_act_range_low,
    School.act_range_high as school_act_range_high,
    School.avg_accepted_gpa as school_avg_accepted_gpa,
    Applications.status 
    FROM User, Student, School, Applications, HighSchool
    WHERE Applications.student_id = Student.id 
    AND Applications.college_id = School.id   
    AND User.id = Student.id 
    AND (HighSchool.id = Student.hs_id OR Student.hs_id IS NULL)
    AND (School.id = ${req.query.college_id})`
  
    console.log('HIGHSCHOOL ID WHAT IS YOU DOING' + req.query.hs_id)
  if (req.query.hs_id != [] && req.query.hs_id != null) {
    console.log(req.query.hs_id[0]);
    query += ` AND (`
    for (let i = 0; i < req.query.hs_id.length; i++) {
      if (i == req.query.hs_id.length - 1) {
        query += ` Student.hs_id = ${req.query.hs_id[i]})`
      } else {
        query += ` Student.hs_id = ${req.query.hs_id[i]} OR`
      }
    }
  } 
  if (req.query.statuses) {
    console.log(req.query.statuses[0]);
    query += ` AND (`
    for (let i = 0; i < req.query.statuses.length; i++) {
      if (i == req.query.statuses.length - 1) {
        query += ` status = ${mysql.escape(req.query.statuses[i])})`
      } else {
        query += ` status = ${mysql.escape(req.query.statuses[i])} OR`
      }
    }
  }
  if (req.query.class_high) {
    query += ` AND Student.grad_year <= ${req.query.class_high}` 
  }

  if (req.query.class_low) {
    query += ` AND Student.grad_year >= ${req.query.class_low}` 
  }
  console.log(query);
  con(query, (err, data) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
      return;
    }
    res.send(data);
  });
}


