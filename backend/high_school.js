let joi = require('joi');
let hsscraper = require('./hs_scraper.js');


// These three are concatenated into the scraper's target URL, so they are
// constrained to characters that cannot alter the path. `state` was min(2).max(2)
// with no character rule, which admitted "//" and "..".
const hsSchema = joi.object({
  name: joi.string().max(255).min(1).token().required(),
  city: joi.string().max(255).min(1).token().required(),
  state: joi.string().pattern(/^[A-Za-z]{2}$/).required(),
});

const hsNameSchema = joi.object({
  name: joi.string().max(255).min(1).required()
});

/*
  When student searches up a school and multiple options are returned:
    pick one of the options from a list
    ask the student before hand to pick location of where their high school is to narrow down options
*/
// Was declared as (con, res, id) but called as (databaseRequest, req, res), so
// `res.query` was really the request, `req` was undefined, and the name went
// into the SQL text unquoted and unescaped.
exports.highschoolByName = (con, req, res) => {
  const {error} = hsNameSchema.validate(req.query);
  if (error) {
    res.sendStatus(400);
    return;
  }
  con('SELECT * FROM HighSchool WHERE name = ?', [req.query.name], (err, data) => {
    if (err) {
      console.error('highschoolByName failed:', err.code);
      res.sendStatus(500);
      return;
    }
    res.send(data);
  });
}

function simScore(score, newval, oldval) {
  if (!newval || !oldval) return 0;
  var dif = 1 - Math.abs((newval - oldval) / Math.abs(oldval))
  return dif < 0 ? 0 : score * dif
}

// Splits a scraped comma-separated column that may be NULL for schools the
// scraper could not fully resolve.
function splitList(value) {
  return value ? String(value).split(',') : [];
}

exports.hsSimilar = (con, req, res) => {
  // The original sent an undefined `err` here, which threw a ReferenceError
  // inside the handler and took the process down instead of returning 400.
  const {error} = hsSchema.validate(req.query);
  if (error) {
    res.sendStatus(400);
    return;
  }
  var highSchoolTag = (req.query.name.replace(/_/g, '-') + '-' + req.query.city.replace(/_/g, '-') + '-' + req.query.state).toLowerCase()
  /*
    takes the id for a highschool (determined using auto complete) and returns a list of
    similar highschools
  */
  hsscraper.scrape(highSchoolTag)
    .then(result => {
      if (!result || !Object.keys(result).length) {
        res.send([])
        return;
      }
      simHSWrapper(con, result, res)
    })
    .catch(e => {
      console.error('high school scrape failed:', e.message);
      res.sendStatus(502);
    });
}

const HS_COLUMNS = ['name', 'city', 'state', 'ap_enroll', 'sat_score', 'act_score', 'interested_schools', 'interested_majors'];

// Scraped values are third-party input. They are bound as parameters rather
// than concatenated, and the numeric columns are coerced so a scraped string
// cannot land in a numeric column as SQL text.
function hsValues(hs) {
  return [
    hs.name || null,
    hs.city || null,
    hs.state || null,
    hs.ap_enroll != null ? Number(hs.ap_enroll) : null,
    hs.sat_score != null ? Number(hs.sat_score) : null,
    hs.act_score != null ? Number(hs.act_score) : null,
    hs.colleges ? hs.colleges.toString() : null,
    hs.majors ? hs.majors.toString() : null
  ];
}

exports.insertHS = (con, highSchool, func) => {
  var highSchoolTag = (highSchool.name.replace(/ /g, '-') + '-' + highSchool.city.replace(/ /g, '-') + '-' + highSchool.state).toLowerCase()
  const lookup = 'SELECT * FROM HighSchool WHERE name = ? AND city = ? AND state = ?';
  con(lookup, [highSchool.name, highSchool.city, highSchool.state], (err, hsData) => {
    if (err) {
      console.error('high school lookup failed:', err.code);
      func();
      return;
    }
    if (hsData.length > 0) {
      func();
      return;
    }
    console.log('scraping from... ' + highSchoolTag)
    hsscraper.scrape(highSchoolTag)
      .then(result => {
        const insert = `INSERT INTO HighSchool (${HS_COLUMNS.join(', ')}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        con(insert, hsValues(result), (insertErr) => {
          if (insertErr) {
            console.error('high school insert failed:', insertErr.code);
          }
          func();
        });
      })
      .catch(e => {
        console.error('high school scrape failed:', e.message);
        func();
      });
  });
}

function simHSWrapper(con, highSchool, res) {
  const lookup = 'SELECT * FROM HighSchool WHERE name = ? AND city = ? AND state = ?';
  const identity = [highSchool.name, highSchool.city, highSchool.state];

  con(lookup, identity, (err, hsData) => {
    if (err) {
      console.error('high school lookup failed:', err.code);
      res.sendStatus(500);
      return;
    }

    let query;
    let values;
    if (hsData.length == 0) {
      query = `INSERT INTO HighSchool (${HS_COLUMNS.join(', ')}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      values = hsValues(highSchool);
    } else {
      // The original built this UPDATE by concatenation and left a stray ')'
      // glued to the last value, producing malformed SQL whenever a school
      // already existed and had no scraped majors.
      query = `UPDATE HighSchool SET ${HS_COLUMNS.map(c => `${c} = ?`).join(', ')}
        WHERE name = ? AND city = ? AND state = ?`;
      values = hsValues(highSchool).concat(identity);
    }

    con(query, values, (writeErr) => {
      if (writeErr) {
        console.error('high school write failed:', writeErr.code);
        res.sendStatus(500);
        return;
      }
      con(lookup, identity, (readErr, refreshed) => {
        if (readErr || refreshed.length <= 0) {
          console.error('high school reload failed:', readErr && readErr.code);
          res.sendStatus(500);
          return;
        }
        similarHighSchoolAlgorithm(con, refreshed[0], res);
      });
    });
  });
}

function similarHighSchoolAlgorithm(con, hs, res) {
  /*
    Actual algorithm
  */
  let query = 'SELECT * FROM HighSchool WHERE name <> ? AND city <> ? AND state <> ?'
  let values = [hs.name, hs.city, hs.state];

  let ranges = [];
  if (hs.sat_score) {
    ranges.push('sat_score BETWEEN ? * .90 AND ? * 1.10');
    values.push(hs.sat_score, hs.sat_score);
  }
  if (hs.act_score) {
    ranges.push('act_score BETWEEN ? * .90 AND ? * 1.10');
    values.push(hs.act_score, hs.act_score);
  }
  if (hs.ap_enroll) {
    ranges.push('ap_enroll BETWEEN ? * .90 AND ? * 1.10');
    values.push(hs.ap_enroll, hs.ap_enroll);
  }
  if (ranges.length > 0) {
    query += ` AND (${ranges.join(' OR ')})`;
  }

  con(query, values, (err, hsList) => {
    if (err) {
      console.error('similar high school query failed:', err.code);
      res.sendStatus(500);
      return;
    }

    // weights in case we need to change values later
    var sat_weight = 15
    var act_weight = 15
    var ap_weight = 20
    var state_weight = 10
    var interestedSchool_weight = 20
    var interestedMajor_weight = 20
    //

    let results = []

    // These columns are NULL for any school the scraper could not fully
    // resolve, and calling .split() on NULL threw.
    var original_hsInterestedSchools = splitList(hs.interested_schools)
    var originalSchool_length = original_hsInterestedSchools.length || 1
    var original_hsInterestedMajors = splitList(hs.interested_majors)
    var originalMajor_length = original_hsInterestedMajors.length || 1

    for (let i = 0; i < hsList.length; i++) {
      let similarity = 0;

      // calculates individual similarity scores that'll be added as a whole and be used for determining highlights
      var sat_simScore = simScore(sat_weight, hsList[i].sat_score, hs.sat_score)
      var act_simScore = simScore(act_weight, hsList[i].act_score, hs.act_score)
      var ap_simScore = simScore(ap_weight, hsList[i].ap_enroll, hs.ap_enroll)
      var state_simScore = hsList[i].state === hs.state ? state_weight : 0

      // interested schools
      // `includes` returns a boolean, and `false != -1` is true, so the original
      // condition matched on every iteration and gave every school full marks.
      var interestedSchool_simScore = 0
      var current_hsInterestedSchools = splitList(hsList[i].interested_schools)
      for (let j = 0; j < current_hsInterestedSchools.length; j++) {
        if (original_hsInterestedSchools.includes(current_hsInterestedSchools[j])) {
          interestedSchool_simScore += interestedSchool_weight / originalSchool_length
        }
      }

      // interested majors
      var interestedMajor_simScore = 0
      var current_hsInterestedMajors = splitList(hsList[i].interested_majors)
      for (let j = 0; j < current_hsInterestedMajors.length; j++) {
        if (original_hsInterestedMajors.includes(current_hsInterestedMajors[j])) {
          interestedMajor_simScore += interestedMajor_weight / originalMajor_length
        }
      }

      // add them up
      similarity += sat_simScore + act_simScore + ap_simScore + state_simScore + interestedSchool_simScore + interestedMajor_simScore

      // highlights
      var highlights = []
      if (sat_simScore >= sat_weight * .85) {
        highlights.push("sat")
      }
      if (act_simScore >= act_weight * .85) {
        highlights.push("act")
      }
      if (ap_simScore >= ap_weight * .85) {
        highlights.push("ap")
      }
      if (state_simScore == state_weight) {
        highlights.push("state")
      }
      if (interestedSchool_simScore >= interestedSchool_weight * .85) {
        highlights.push("school")
      }
      if (interestedMajor_simScore >= interestedMajor_weight * .85) {
        highlights.push("major")
      }

      var similarity_report = {
        high_school: hsList[i],
        similarity_score: Math.round(similarity),
        highlights: highlights
      }
      results.push(similarity_report);
    }
    // sorts list by similarity score
    results.sort((a, b) => (a.similarity_score < b.similarity_score) ? 1 : -1)
    res.send(results);
  });
}

exports.hsList = (con, req, res) => {
  con('SELECT * FROM HighSchool', (err, data) => {
    if (err) {
      console.error('hsList failed:', err.code);
      res.sendStatus(500);
      return;
    }
    res.send(data);
  });
}
