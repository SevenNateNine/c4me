let joi = require('joi');


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

// column, query parameter, comparison. In a lax search each condition is also
// satisfied by a NULL column, which is the only difference between the two modes.
const RANGE_FILTERS = [
  ['admission_rate', 'admission_low', '>'],
  ['admission_rate', 'admission_high', '<'],
  ['cost', 'cost_low', '>'],
  ['cost', 'cost_high', '<'],
  ['ranking', 'rank_low', '>'],
  ['ranking', 'rank_high', '<'],
  ['size', 'size_low', '>'],
  ['size', 'size_high', '<'],
  ['sat_math', 'sat_math_low', '>'],
  ['sat_math', 'sat_math_high', '<'],
  ['sat_ebrw', 'sat_ebrw_low', '>'],
  ['sat_ebrw', 'sat_ebrw_high', '<'],
  ['act_composite', 'act_comp_low', '>'],
  ['act_composite', 'act_comp_high', '<']
];

exports.search = (con, req, res) => {
  const {error} = searchSchema.validate(req.query);
  if (error) {
    res.status(400).send({error: 'invalid search parameters'});
    return;
  }
  if (req.query.type != 's' && req.query.type != 'l') {
    res.sendStatus(400);
    return;
  }

  const lax = req.query.type == 'l';
  const conditions = [];
  const values = [];

  // Every value below is bound rather than concatenated. The joi schema already
  // constrains these to numbers, but a query builder that pastes request data
  // into SQL text is one schema edit away from being injectable again.
  const add = (fragment, column, ...params) => {
    conditions.push(lax ? `(${fragment} OR ${column} IS NULL)` : fragment);
    values.push(...params);
  };

  for (const [column, param, comparison] of RANGE_FILTERS) {
    if (req.query[param]) {
      add(`${column} ${comparison} ?`, column, req.query[param]);
    }
  }

  if (req.query.states && req.query.states.length > 0) {
    add(`state IN (?)`, 'state', req.query.states);
  }
  if (req.query.region) {
    add(`region LIKE ?`, 'region', req.query.region);
  }
  if (req.query.name) {
    // replace() without /g only swaps the first underscore, so multi-word
    // school names never matched past their second word.
    add(`name LIKE ?`, 'name', `%${req.query.name.replace(/_/g, ' ')}%`);
  }
  if (req.query.major1) {
    conditions.push('EXISTS(SELECT * FROM Majors WHERE major LIKE ? AND School.id = Majors.school_id)');
    values.push(req.query.major1.replace(/_/g, ' '));
  }
  if (req.query.major2) {
    conditions.push('EXISTS(SELECT * FROM Majors WHERE major LIKE ? AND School.id = Majors.school_id)');
    values.push(req.query.major2.replace(/_/g, ' '));
  }

  const query = conditions.length > 0
    ? `SELECT * FROM School WHERE ${conditions.join(' AND ')}`
    : 'SELECT * FROM School';

  con(query, values, (err, data) => {
    if (err) {
      console.error('school search failed:', err.code);
      res.sendStatus(500);
      return;
    }
    res.send(data);
  });
}

exports.get = (con, req, res) => {
  if (joi.number().integer().positive().required().validate(req.query.id).error) {
    res.sendStatus(400);
    return;
  }
  con('SELECT * FROM School WHERE id = ?', [req.query.id], (err, data) => {
    if (err) {
      console.error('school lookup failed:', err.code);
      res.sendStatus(500);
      return
    }
    res.send(data)
  })
}

const rankValidation = joi.object({
  // `search` was optional, so a request without it reached
  // req.query.search.length and threw a TypeError out of the handler.
  search: joi.array().items(joi.number().integer().positive()).min(1).max(500).required()
});

exports.rank = (con, req, res, id) => {
  //this is where the ranking of searches are handled
  //the ids of all schools in a search should be included as a list in query data
  const {error} = rankValidation.validate(req.query);
  if (error) {
    res.status(400).send({error: 'search must be a non-empty list of school ids'});
    return;
  }
  con('SELECT * FROM Student WHERE id = ?', [id], (err, studentData) => {
    if (err || studentData.length == 0) {
      console.error('student lookup failed:', err && err.code);
      res.sendStatus(400);
      return;
    }
    // The ebrw aggregates were both aliased app_sat_math_avg/app_sat_math_std,
    // overwriting the math columns and leaving app_sat_ebrw_avg undefined — so
    // the EBRW term below never contributed to the score.
    const query = `SELECT School.id as id, School.avg_accepted_gpa as avg_accepted_gpa,
      School.sat_math as sat_math,
      School.sat_ebrw as sat_ebrw,
      School.act_composite as act_composite,
      AVG(Student.gpa) as app_gpa_avg,
      AVG(Student.sat_math) as app_sat_math_avg,
      AVG(Student.sat_ebrw) as app_sat_ebrw_avg,
      AVG(Student.act_comp) as app_act_avg,
      STD(Student.gpa) as app_gpa_std,
      STD(Student.sat_math) as app_sat_math_std,
      STD(Student.sat_ebrw) as app_sat_ebrw_std,
      STD(Student.act_comp) as app_act_std,
      BIT_OR(Majors.major = ?) as major1,
      BIT_OR(Majors.major = ?) as major2
      FROM School
        LEFT JOIN Majors ON School.id = Majors.school_id
        LEFT JOIN Applications ON School.id = Applications.college_id
          AND Applications.status = 'Accepted'
          AND Applications.questionable = FALSE
        LEFT JOIN Student ON Student.id = Applications.student_id
      WHERE School.id IN (?)
      GROUP BY School.id`;
    const values = [studentData[0].major1, studentData[0].major2, req.query.search];

    con(query, values, (queryError, schoolData) => {
      if (queryError || schoolData.length == 0) {
        console.error('rank query failed:', queryError && queryError.code);
        res.sendStatus(400);
        return
      }
      let results = []
      for (let i = 0; i < schoolData.length; i++) {
        //score recomendation calculation
        let score = 0;

        //this should work for the most part
        //but it can result in negitive values.
        //it works on the assumption that 4 standard distributions out is highly unlikley
        if (studentData[0].gpa && schoolData[i].app_gpa_avg) {
          score += 10 - (Math.abs(studentData[0].gpa - schoolData[i].app_gpa_avg) / 4) * 10;
        }
        if (studentData[0].sat_math && schoolData[i].app_sat_math_avg) {
          score += 10 - (Math.abs(studentData[0].sat_math - schoolData[i].app_sat_math_avg) / 600) * 10;
            //200 is the lowest value so the max difference is 600
        }
        if (studentData[0].sat_ebrw && schoolData[i].app_sat_ebrw_avg) {
          score += 10 - (Math.abs(studentData[0].sat_ebrw - schoolData[i].app_sat_ebrw_avg) / 600) * 10;
        }
        if (studentData[0].act_comp && schoolData[i].app_act_avg) {
          score += 10 - (Math.abs(studentData[0].act_comp - schoolData[i].app_act_avg) / 35) * 10;
          //lowest posible score is 1 so the max difference is 35
        }

        if (studentData[0].gpa && schoolData[i].avg_accepted_gpa) {
          score += 10 - (Math.abs(studentData[0].gpa - schoolData[i].avg_accepted_gpa) / 4.0) * 10;
        }
        if (studentData[0].sat_math && schoolData[i].sat_math) {
          score += 10 - (Math.abs(studentData[0].sat_math - schoolData[i].sat_math) / 600) * 10;
        }
        if (studentData[0].sat_ebrw && schoolData[i].sat_ebrw) {
          score += 10 - (Math.abs(studentData[0].sat_ebrw - schoolData[i].sat_ebrw) / 600) * 10;
        }
        if (studentData[0].act_comp && schoolData[i].act_composite) {
          score += 10 - (Math.abs(studentData[0].act_comp - schoolData[i].act_composite) / 35) * 10;
        }
        results.push({id: schoolData[i].id, result: score, major1: schoolData[i].major1, major2: schoolData[i].major2});
      }
      res.status(200).send(results);
    });
  });
}

exports.majorsList = (con, req, res) => {
  con('SELECT DISTINCT(major) AS major FROM Majors ORDER BY major', (err, data) => {
    if (err) {
      console.error('majorsList failed:', err.code);
      res.sendStatus(500);
      return
    }
    res.send(data);
  });
}

exports.schoolList = (con, req, res) => {
  con('SELECT * FROM School', (err, data) => {
    if (err) {
      console.error('schoolList failed:', err.code);
      res.sendStatus(500);
      return
    }
    res.send(data);
  });
}
