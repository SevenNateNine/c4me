let joi = require('@hapi/joi');
let mysql = require('mysql');


const searchSchema = joi.object({
  type: joi.string().max(1).min(1).token().required(),
  
  admission_low: joi.number().integer().min(0).max(100),  
  admission_high: joi.number().integer().min(0).max(100),
 
  cost_high: joi.number().min(0).max(9999999),
  cost_low: joi.number().min(0).max(9999999),

  states: joi.array().items(joi.string().min(2).max(2).token()),
  
  region: joi.string().max(20).token(),
  
  rank_low: joi.number().integer().min(1),  
  rank_high: joi.number().integer().min(1), 
  
  size_low: joi.number().integer().min(0).max(99999),  
  size_high: joi.number().integer().min(0).max(99999),
  
  sat_math_low: joi.number().integer().min(200).max(800), //check this  
  sat_math_high: joi.number().integer().min(200).max(800),
  
  sat_ebrw_low: joi.number().integer().min(200).max(800), //check this  
  sat_ebrw_high: joi.number().integer().min(200).max(800),

  act_comp_low: joi.number().integer().min(1).max(36), //check this 
  act_comp_high: joi.number().integer().min(1).max(36),

  name: joi.string().max(255).token().allow(''),

  major1: joi.string().max(255).token(), 
  major2: joi.string().max(255).token()
});

exports.search = (con, req, res) => { 
  const {error, value} = searchSchema.validate(req.query);
  if (error) {    
    res.status(400).send(error);
    console.log(error);
    return;
  }
  if (req.query.type == 's') { //strict seach
    let query = 'SELECT * FROM School WHERE'
    if (req.query.admission_low) {
      query += ` admission_rate > ${req.query.admission_low} AND`
    }
    if (req.query.admission_high) {
      query += ` admission_rate < ${req.query.admission_high} AND`
    }

    if (req.query.cost_low) {
      query += ` cost > ${req.query.cost_low} AND`
    }
    if (req.query.cost_high) {
      query += ` cost < ${req.query.cost_high} AND`
    }

    if (req.query.states) {
      query += ' ('
      for (i = 0; i < req.query.states.length; i++) {
        if (i == req.query.states.length - 1) {
          query += ` state LIKE ${mysql.escape(req.query.states[i])}) AND` 
        } else {
          query += ` state LIKE ${mysql.escape(req.query.states[i])} OR`
        }
      }
    }
    if (req.query.region) {
      query += ` region LIKE ${mysql.escape(req.query.region)} AND`
    }
    if (req.query.name) {
      let name = `%${req.query.name.replace('_',' ')}%`
        query += ` name LIKE ${mysql.escape(name)} AND`
      }
      if (req.query.rank_low) {
        query += ` ranking > ${req.query.rank_low} AND`
      }
      if (req.query.rank_high) {
        query += ` ranking < ${req.query.rank_high} AND`
      }
      if (req.query.size_low) {
        query += ` size > ${req.query.size_low} AND`
      }
      if (req.query.size_high) {
        query += ` size < ${req.query.size_high} AND`
      }
      
      if (req.query.sat_math_low) {
        query += ` sat_math > ${req.query.sat_math_low} AND`
      }
      if (req.query.sat_math_high) {
        query += ` sat_math < ${req.query.sat_math_high} AND`
      }
      
      if (req.query.sat_ebrw_low) {
        query += ` sat_ebrw > ${req.query.sat_ebrw_low} AND`
      }
      if (req.query.sat_ebrw_high) {
        query += ` sat_ebrw < ${req.query.sat_ebrw_high} AND`
      }

      if (req.query.act_comp_low) {
        query += ` act_composite > ${req.query.act_comp_low} AND`
      }
      if (req.query.act_comp_high) {
        query += ` act_composite < ${req.query.act_comp_high} AND`
      }
      if (req.query.major1) {
        let major1 = `${req.query.major1.replace('_',' ')}`
        query += ` EXISTS(SELECT * FROM Majors WHERE major LIKE ${mysql.escape(major1)} AND School.id = Majors.school_id) AND`
      }
      if (req.query.major2) {
        let major2 = `${req.query.major2.replace('_',' ')}`
        query += ` EXISTS(SELECT * FROM Majors WHERE major LIKE ${mysql.escape(major2)} AND School.id = Majors.school_id) AND`
      }
      
      // removes the last ' AND'
      query = query.substring(0, query.length - 4);
      console.log(query);

      con(query, (err, data) => {
        if (err) {
          console.log(err);
          res.status(400).send(err);
          return;
        }
        res.send(data);
      });
    } else if (req.query.type == 'l') {//lax seach
      let query = 'SELECT * FROM School WHERE'
      if (req.query.admission_low) {
      query += ` (admission_rate > ${req.query.admission_low} OR admission_rate IS NULL) AND`
    }
    if (req.query.admission_high) {
      query += ` (admission_rate < ${req.query.admission_high} OR admission_rate IS NULL) AND`
    }
    
    if (req.query.cost_low) {
      query += ` (cost > ${req.query.cost_low} OR cost IS NULL) AND`
    }
    if (req.query.cost_high) {
      query += ` (cost < ${req.query.cost_high} OR cost IS NULL) AND`
    }

    if (req.query.states) {
      query += ' ('
      for (i = 0; i < req.query.states.length; i++) {
        query += `state LIKE ${mysql.escape(req.query.states[i])} OR `
      }
      query += 'state IS NULL) AND'
    }
    if (req.query.region) {
      query += ` (region LIKE ${mysql.escape(req.query.region)} OR region IS NULL) AND`
    }
    if (req.query.name) {
      let name = `%${req.query.name.replace('_',' ')}%`
      query += ` (name LIKE ${mysql.escape(name)} OR name IS NULL) AND`
    }

    if (req.query.rank_low) {
      query += ` (ranking > ${req.query.rank_low} OR ranking IS NULL) AND`
    }
    if (req.query.rank_high) {
      query += ` (ranking < ${req.query.rank_high} OR ranking IS NULL) AND`
    }
    if (req.query.size_low) {
      query += ` (size > ${req.query.size_low} OR size IS NULL) AND`
    }
    if (req.query.size_high) {
      query += ` (size < ${req.query.size_high} OR size IS NULL) AND`
    }
    
    if (req.query.sat_math_low) {
      query += ` (sat_math > ${req.query.sat_math_low} OR sat_math IS NULL) AND`
    }
    if (req.query.sat_math_high) {
      query += ` (sat_math < ${req.query.sat_math_high} OR sat_math IS NULL) AND`
    }
    
    if (req.query.sat_ebrw_low) {
      query += ` (sat_ebrw > ${req.query.sat_ebrw_low} OR sat_ebrw IS NULL) AND`
    }
    if (req.query.sat_ebrw_high) {
      query += ` (sat_ebrw < ${req.query.sat_ebrw_high} OR sat_ebrw IS NULL) AND`
    }

    if (req.query.act_comp_low) {
      query += ` (act_composite > ${req.query.act_comp_low} OR act_composite IS NULL) AND`
    }
    if (req.query.act_comp_high) {
      query += ` (act_composite < ${req.query.act_comp_high} OR act_composite IS NULL) AND`
    }

    if (req.query.major1) {
      let major1 = `${req.query.major1.replace('_',' ')}`
      query += ` EXISTS(SELECT * FROM Majors WHERE major LIKE ${mysql.escape(major1)} AND School.id = Majors.school_id) AND`
    }
    if (req.query.major2) {
      let major2 = `${req.query.major2.replace('_',' ')}`
      query += ` EXISTS(SELECT * FROM Majors WHERE major LIKE ${mysql.escape(major2)} AND School.id = Majors.school_id) AND`
    }
    
    // removes the last ' AND'
    query = query.substring(0, query.length - 4);
    console.log(query);

    con(query, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).send(err);
        return;
      }
      res.send(data);
    });
  } else {
    res.sendStatus(400);
  }
}
exports.get = (con, req, res) => {
  if (joi.number().integer().validate(req.query.id).error) {
    res.sendStatus(400);
    return;
  }
  console.log(`school request id: ${req.query.id}`);
  const query = mysql.format('SELECT * FROM School WHERE id = ?', [req.query.id]);
  con(query, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return
    }
    res.send(data)
  })
}

const rankValidation = joi.object({
  search: joi.array().items(joi.number().integer().positive())   
});
exports.rank = (con, req, res, id) => { 
  //this is where the ranking of searches are handled
  //the ids of all schools in a search should be included as a list in query data
  const {error, values} = rankValidation.validate(req.query);
  if (error) {
    res.status(400).send(error);
    return;
  }
  con(`SELECT * FROM Student WHERE id = ${id}`, (err, studentData) => {
    if (err || studentData.length == 0) {
      res.status(400).send(err)
      return;
    }
    let query = `SELECT School.id as id, School.avg_accepted_gpa as avg_accepted_gpa,
      School.sat_math as sat_math, 
      School.sat_ebrw as sat_ebrw, 
      School.act_composite as act_composite,
      AVG(Student.gpa) as app_gpa_avg,
      AVG(Student.sat_math) as app_sat_math_avg,
      AVG(Student.sat_ebrw) as app_sat_math_avg,
      AVG(Student.act_comp) as app_act_avg,
      STD(Student.gpa) as app_gpa_std,
      STD(Student.sat_math) as app_sat_math_std,
      STD(Student.sat_ebrw) as app_sat_math_std,
      STD(Student.act_comp) as app_act_std, 
      BIT_OR(Majors.major = ${mysql.escape(studentData[0].major1)}) as major1,
      BIT_OR(Majors.major = ${mysql.escape(studentData[0].major2)}) as major2
      FROM School 
        LEFT JOIN Majors ON School.id = Majors.school_id
        LEFT JOIN Applications ON School.id = Applications.college_id 
          AND Applications.status = 'Accepted'
          AND Applications.questionable = FALSE
        LEFT JOIN Student ON Student.id = Applications.student_id
      WHERE (`
    for (let i = 0; i < req.query.search.length; i++) {
      if (i == req.query.search.length - 1) {
        query += ` School.id = ${req.query.search[i]})`
      } else {
        query += ` School.id = ${req.query.search[i]} OR`
      }
    }
    query += ` GROUP BY School.id`
    console.log(query);
    con(query, (error, schoolData) => {
      if (error || schoolData.length == 0) {
        res.status(400).send(error);
        return
      }
      console.log(schoolData)
      let results = []
      for (let i = 0; i < schoolData.length; i++) {
        //score recomendation calculation
        let score = 0;

        //this should work for the most part 
        //but it can result in negitive values.
        //it works on the assumption that 4 standard distributions out is highly unlikley 
        if (studentData[0].gpa && schoolData[i].app_gpa_avg) {
          score += 10 - (Math.abs(studentData[0].gpa - schoolData[i].app_gpa_avg)/4)*10; 
        }
        if (studentData[0].sat_math && schoolData[i].app_sat_math_avg) {
          score += 10 - (Math.abs(studentData[0].sat_math - schoolData[i].app_sat_math_avg)/600)*10; 
            //200 is the lowest value so the max difference is 600
        }
        if (studentData[0].sat_ebrw && schoolData[i].app_sat_ebrw_avg) {
          score += 10 - (Math.abs(studentData[0].sat_ebrw - schoolData[i].app_sat_ebrw_avg)/600)*10; 
        }
        if (studentData[0].act_comp && schoolData[i].app_act_avg) {
          score += 10 - (Math.abs(studentData[0].act_comp - schoolData[i].app_act_avg)/35)*10;
          //lowest posible score is 1 so the max difference is 35
        }


        if (studentData[0].gpa && schoolData[i].avg_accepted_gpa) {
          score += 10 - (Math.abs(studentData[0].gpa - schoolData[i].avg_accepted_gpa)/4.0)*10; 
        }
        if (studentData[0].sat_math && schoolData[i].sat_math) {
          score += 10 - (Math.abs(studentData[0].sat_math - schoolData[i].sat_math)/600)*10; 
        }
        if (studentData[0].sat_ebrw && schoolData[i].sat_ebrw) {
          score += 10 - (Math.abs(studentData[0].sat_ebrw - schoolData[i].sat_ebrw)/600)*10; 
        }
        if (studentData[0].act_comp && schoolData[i].act_composite) {
          score += 10 - (Math.abs(studentData[0].act_comp - schoolData[i].act_composite)/35)*10; 
        }
        console.log(`School id: ${schoolData[i].id}, score: ${score}, major1: ${schoolData[i].major1}, major2: ${schoolData[i].major2}`);
        results.push({id: schoolData[i].id, result: score, major1: schoolData[i].major1, major2: schoolData[i].major2});
      }
      res.status(200).send(results);
    });
  });
}

exports.majorsList = (con, req, res) => {
  let query = 'SELECT DISTINCT(major) AS major FROM Majors ORDER BY major'; 
  con(query, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return
    }
    res.send(data);
  });
}

exports.schoolList = (con, req, res) => {
  let query = 'SELECT * FROM School'; 
  con(query, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return
    }
    res.send(data);
  });
}
