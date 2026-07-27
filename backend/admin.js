let fs = require('fs');
let path = require('path');
let csv = require('fast-csv');
let https = require('https');
let cdscraper = require('./cd_scraper.js');
let crscraper = require('./cr_scraper.js');
let user = require('./user.js');
let application = require('./application.js');
let parse = require('csv-parse/sync').parse;
let eol = require('os').EOL;
let highSchool = require('./high_school.js');

const SCORECARD_URL = 'https://ed-public-download.app.cloud.gov/downloads/Most-Recent-Cohorts-All-Data-Elements.csv';
const SCORECARD_FILE = path.join(__dirname, 'CollegeScoreCard.csv');

// CSV cells and scraped page text are third-party input: the College Scorecard
// download, the CollegeData and CollegeRank scrapers, and operator-supplied
// student CSVs all end up here. Everything below is bound as a parameter, and
// numeric columns are coerced so a cell containing SQL text cannot reach the
// database as SQL text.
function num(value) {
  if (value === null || value === undefined || value === '' || value === 'NULL' || value === 'PrivacySuppressed') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function str(value) {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

exports.deleteAllStudents = (con, req, res) => {
  con('DELETE FROM Applications', (err) => {
    if (err) {
      console.error('deleteAllStudents (applications) failed:', err.code);
      res.sendStatus(500);
      return;
    }
    // Chained rather than fired in parallel: Applications references Student,
    // so issuing both at once raced the foreign key and could send two responses.
    con('DELETE FROM Student', (studentErr) => {
      if (studentErr) {
        console.error('deleteAllStudents (students) failed:', studentErr.code);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
}

const nameMapping = {
  'Columbia College':'Columbia University',
  'Franklin and Marshall College':'Franklin & Marshall College',
  'Georgia Institute of Technology-Main Campus':'Georgia Institute of Technology',
  'Ohio State University-Main Campus':'Ohio State University (Main campus)',
  'Purdue University-Main Campus':'Purdue University West Lafayette',
  'Texas A & M University-College Station':'Texas A&M University-College Station',
  'Tulane University of Louisiana':'Tulane University',
  'University of California-Berkeley':'University of California, Berkeley',
  'University of California-Davis':'University of California, Davis',
  'University of California-Irvine':'University of California, Irvine',
  'University of California-Los Angeles':'University of California, Los Angeles',
  'University of California-San Diego':'University of California, San Diego',
  'University of California-Santa Barbara':'University of California, Santa Barbara',
  'University of California-Santa Cruz':'University of California, Santa Cruz',
  'California State University-East Bay':'California State University, East Bay',
  'California State University-Fresno':'California State University, Fresno',
  'California State University-Monterey Bay':'California State University, Monterey Bay',
  'University of Maryland-College Park':'University of Maryland, College Park',
  'University of Minnesota-Twin Cities':'University of Minnesota Twin Cities',
  'University of Pittsburgh-Pittsburgh Campus':'University of Pittsburgh-Pittsburgh campus',
  'The University of Texas at Austin':'University of Texas at Austin',
  'University of Virginia-Main Campus':'University of Virginia (Main campus)',
  'University of Washington-Seattle Campus':'University of Washington-Seattle',
  'College of William and Mary':'William & Mary',
  'University of Nevada-Las Vegas':'University of Nevada, Las Vegas',
  'University of Nevada-Reno':'University of Nevada, Reno',
  'The College of Saint Scholastica':'The College of St Scholastica',
  'The University of Alabama':'University of Alabama',
  'Indiana University-Bloomington':'Indiana University Bloomington',
  'University of Massachusetts-Amherst':'University of Massachusetts Amherst',
  'The University of Montana':'University of Montana'
}

function getProperName(name, list) {
  if (nameMapping[name] != null && list.includes(nameMapping[name])) {
    return nameMapping[name];
  } else if (list.includes(name)) {
    return name;
  } else return null;
}

function selectRegion(state){
  let Northeast = ['CT','ME','MA', 'NH','RI','VT','NJ','NY','PA'];
  let Midwest = ['IL','IN','MI','OH','WI','IA','KS','MN','MO','NE','ND','SD'];
  let South = ['DE','FL','GA','MD','NC','SC','VA','DC','WV','AL','KY','MS','TN','AR','LA','OK','TX'];
  let West = ['AZ','CO','ID','MT','NV','NM','UT','WY','AK','CA','HI','OR','WA'];
  if(Northeast.includes(state)){
    return 'Northeast';
  }
  else if(Midwest.includes(state)){
    return 'Midwest';
  }
  else if(South.includes(state)){
    return 'South';
  }
  else if(West.includes(state)){
    return 'West';
  }
  else{
    return null;
  }
}

const SCORECARD_COLUMNS = ['name', 'city', 'state', 'region', 'admission_rate', 'cost', 'size',
  'act_composite', 'sat_math', 'sat_ebrw', 'sat_math_range_low', 'sat_math_range_high',
  'sat_ebrw_range_low', 'sat_ebrw_range_high', 'act_range_low', 'act_range_high'];

function handleScoreCardRow(con, row, list) {
  let name = getProperName(row.INSTNM, list);
  if (!name) return;

  const admissionRate = num(row.ADM_RATE);
  const values = [
    name,
    str(row.CITY),
    str(row.STABBR),
    selectRegion(row.STABBR),
    // null * 100 is 0, not null, so a suppressed admission rate used to be
    // stored as a real 0% rate.
    admissionRate === null ? null : admissionRate * 100,
    num(row.COSTT4_A),
    num(row.OVERALL_YR4_N),
    num(row.ACTCMMID),
    num(row.SATMTMID),
    num(row.SATVRMID),
    num(row.SATMT25),
    num(row.SATMT75),
    num(row.SATVR25),
    num(row.SATVR75),
    num(row.ACTCM25),
    num(row.ACTCM75)
  ];

  const placeholders = SCORECARD_COLUMNS.map(() => '?').join(', ');
  const updates = SCORECARD_COLUMNS.filter(c => c !== 'region').map(c => `${c} = VALUES(${c})`).join(', ');
  const query = `INSERT INTO School (${SCORECARD_COLUMNS.join(', ')}) VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updates}`;

  con(query, values, (err) => {
    if (err) console.error('scorecard row failed:', err.code);
  });
}

exports.ScrapeFromScoreCardFile = (con, req, res) => {
  console.log('scrape from score card inititiated');
  let collegeList = null;
  try {
    collegeList = fs.readFileSync(path.join(__dirname, 'colleges.txt'), 'utf8');
  } catch (e) {
    console.error('cannot read colleges.txt:', e.message);
    res.sendStatus(500);
    return;
  }
  collegeList = collegeList.split(eol);

  const out = fs.createWriteStream(SCORECARD_FILE);
  https.get(SCORECARD_URL, (download) => {
    if (download.statusCode !== 200) {
      console.error('scorecard download failed with status', download.statusCode);
      out.close();
      res.sendStatus(502);
      return;
    }
    download.pipe(out);
    out.on('finish', () => {
      out.close(() => {
        fs.createReadStream(SCORECARD_FILE)
          .pipe(csv.parse({headers: true}))
          .on('error', error => console.error('scorecard parse failed:', error.message))
          .on('data', row => handleScoreCardRow(con, row, collegeList))
          // The unlink used to run as soon as the stream was created, deleting
          // the file out from under the parser that was still reading it.
          .on('end', rowCount => {
            console.log(`Parsed ${rowCount} rows`);
            fs.unlink(SCORECARD_FILE, (err) => {
              if (err) console.error('could not remove scorecard file:', err.message);
            });
          });
        res.sendStatus(200);
      });
    });
  }).on('error', (e) => {
    console.error('scorecard request failed:', e.message);
    res.sendStatus(502);
  });
}

function handleCollegeRank(con, rows, done) {
  const values = rows.map(r => [str(r.name), num(r.rank)]).filter(v => v[0] !== null);
  if (values.length === 0) {
    done();
    return;
  }
  const query = `INSERT INTO School (name, ranking) VALUES ?
    ON DUPLICATE KEY UPDATE name = VALUES(name), ranking = VALUES(ranking)`;
  con(query, [values], (err) => {
    if (err) console.error('college rank insert failed:', err.code);
    done();
  });
}

exports.scrapeFromCollegeRank = (con, req, res) => {
  crscraper.scrape().then(result => {
    if (!result || !Object.keys(result).length) {
      res.send([]);
      return;
    }
    handleCollegeRank(con, result, () => res.sendStatus(200));
  }).catch(e => {
    console.error('college rank scrape failed:', e.message);
    res.sendStatus(502);
  });
}

const COLLEGE_DATA_COLUMNS = ['name', 'city', 'state', 'admission_rate', 'cost', 'size',
  'act_composite', 'sat_math', 'sat_ebrw', 'act_range_low', 'act_range_high',
  'sat_math_range_low', 'sat_math_range_high', 'sat_ebrw_range_low', 'sat_ebrw_range_high',
  'avg_accepted_gpa', 'region'];

function handleCollegeData(con, rows, done) {
  const values = rows.map(r => [
    str(r.name), str(r.city), str(r.state),
    num(r.admission_rate), num(r.cost), num(r.size), num(r.act_composite),
    num(r.sat_math), num(r.sat_ebrw), num(r.act_low), num(r.act_high),
    num(r.math_low), num(r.math_high), num(r.ebrw_low), num(r.ebrw_high),
    num(r.avgGPA), selectRegion(r.state)
  ]).filter(v => v[0] !== null);

  if (values.length === 0) {
    done();
    return;
  }
  const updates = COLLEGE_DATA_COLUMNS.map(c => `${c} = VALUES(${c})`).join(', ');
  const query = `INSERT INTO School (${COLLEGE_DATA_COLUMNS.join(', ')}) VALUES ?
    ON DUPLICATE KEY UPDATE ${updates}`;
  con(query, [values], (err) => {
    if (err) console.error('college data insert failed:', err.code);
    done();
  });
}

function handleMajorData(con, rows, done) {
  const pairs = [];
  for (const row of rows) {
    if (!row.majors || !Array.isArray(row.majors)) continue;
    for (const major of row.majors) {
      if (str(row.name) && str(major)) {
        pairs.push([str(row.name), str(major)]);
      }
    }
  }
  if (pairs.length === 0) {
    done();
    return;
  }
  // The school id is resolved by the subselect rather than interpolated.
  const placeholders = pairs.map(() => '((SELECT id FROM School WHERE School.name = ? LIMIT 1), ?)').join(', ');
  const query = `INSERT INTO Majors (school_id, major) VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE major = VALUES(major)`;
  con(query, pairs.flat(), (err) => {
    if (err) console.error('major data insert failed:', err.code);
    done();
  });
}

exports.scrapeFromCollegeData = (con, req, res) => {
  console.log("Starting CollegeData scrape...")
  cdscraper.scrape().then(result => {
    if (!result || !Object.keys(result).length) {
      res.send([]);
      return;
    }
    handleCollegeData(con, result, () => {
      handleMajorData(con, result, () => {
        console.log("Majors and Colleges are handled")
        res.sendStatus(200);
      });
    });
  }).catch(e => {
    console.error('college data scrape failed:', e.message);
    res.sendStatus(502);
  });
}

const STUDENT_IMPORT_COLUMNS = ['id', 'hs_id', 'major1', 'major2', 'grad_year', 'sat_math',
  'sat_ebrw', 'act_eng', 'act_math', 'act_reading', 'act_science', 'act_comp', 'sat_lit',
  'sat_us', 'sat_mathI', 'sat_mathII', 'sat_eco', 'sat_mol', 'sat_chem', 'sat_phy',
  'numAPs', 'gpa'];

function handleStudentDataRow(con, rows, callback, i) {
  if (i >= rows.length) return;
  let row = rows[i];
  const next = () => handleStudentDataRow(con, rows, callback, i + 1);

  highSchool.insertHS(con, {
    name: row['high_school_name'],
    city: row['high_school_city'],
    state: row['high_school_state']
  }, () => {
    user.passwordHash(row['password'], (hashError, hash) => {
      if (hashError) {
        console.error('import hash failed:', hashError.message);
        next();
        return;
      }
      const userQuery = `REPLACE INTO User (user_name, password, type) VALUES (?, ?, 'Student')`;
      con(userQuery, [str(row.userid), hash], (error2, rows2) => {
        if (error2) {
          console.error('import user failed:', error2.code);
          next();
          return;
        }
        const placeholders = STUDENT_IMPORT_COLUMNS.map(c => c === 'hs_id' ? 'id' : '?').join(', ');
        const studentQuery = `INSERT INTO Student (${STUDENT_IMPORT_COLUMNS.join(', ')})
          SELECT ${placeholders} FROM HighSchool
          WHERE name = ? AND city = ? AND state = ?`;
        const values = [
          rows2.insertId,
          str(row.major_1),
          str(row.major_2),
          // The original wrote `row['college_class'] = ''` — an assignment, not
          // a comparison — which blanked the field and then stored the blank.
          num(row['college_class']),
          num(row['SAT_math']),
          num(row['SAT_EBRW']),
          num(row['ACT_English']),
          num(row['ACT_math']),
          num(row['ACT_reading']),
          num(row['ACT_science']),
          num(row['ACT_composite']),
          num(row['SAT_literature']),
          num(row['SAT_US_hist']),
          num(row['SAT_math_I']),
          num(row['SAT_math_II']),
          num(row['SAT_eco_bio']),
          num(row['SAT_mol_bio']),
          num(row['SAT_chemistry']),
          num(row['SAT_physics']),
          num(row['num_AP_passed']),
          num(row['GPA']),
          str(row['high_school_name']),
          str(row['high_school_city']),
          str(row['high_school_state'])
        ];
        con(studentQuery, values, (error3) => {
          if (error3) {
            console.error('import student failed:', error3.code);
            next();
            return;
          }
          callback(rows2.insertId, row.userid);
          next();
        });
      });
    });
  });
}

const STATUS_MAP = {
  'wait-listed': 'Waitlisted',
  'pending': 'Pending',
  'accepted': 'Accepted',
  'denied': 'Rejected',
  'deferred': 'Deferred'
};

function handleApplicationDataRow(con, id, row) {
  const status = STATUS_MAP[row.status];
  if (!status) return;
  con('SELECT School.id as college_id FROM School WHERE School.name = ?', [str(row.college)],
    (error, result) => {
      if (error || !result || result.length === 0) {
        return;
      }
      application.insertApplication(con, id, result[0].college_id, status);
    });
}

// Was unreachable in practice: the SELECT was not valid SQL ("School.id as
// college_id AND User.id as student.id as student_id") and the insert referenced
// an `id` that was never defined in this scope.
function handleApplicationDataRow2(con, row) {
  const status = STATUS_MAP[row.status];
  if (!status) return;
  const query = `SELECT School.id as college_id, User.id as student_id
    FROM School, User
    WHERE School.name = ? AND User.user_name = ?`;
  con(query, [str(row.college), str(row.userid)], (error, result) => {
    if (error || !result || result.length === 0) {
      return;
    }
    application.insertApplication(con, result[0].student_id, result[0].college_id, status);
  });
}

function readCsv(name) {
  return parse(fs.readFileSync(path.join(__dirname, name)), {columns: true, skip_empty_lines: true});
}

exports.pullFromStudentDataSet = (con, req, res) => {
  console.log('pulling from files:');
  let students, applications;
  try {
    students = readCsv('students.csv');
    applications = readCsv('applications.csv');
  } catch (e) {
    console.error('cannot read import files:', e.message);
    res.sendStatus(500);
    return;
  }

  handleStudentDataRow(con, students, (id, name) => {
    for (let i = 0; i < applications.length; i++) {
      if (applications[i].userid === name) {
        handleApplicationDataRow(con, id, applications[i]);
      }
    }
  }, 0);
  res.sendStatus(200);
}

exports.pullFromStudentData = (con, req, res) => {
  console.log('pulling from files:');
  let students;
  try {
    students = readCsv('students.csv');
  } catch (e) {
    console.error('cannot read students.csv:', e.message);
    res.sendStatus(500);
    return;
  }
  handleStudentDataRow(con, students, () => {}, 0);
  res.sendStatus(200);
}

exports.pullFromApplicationData = (con, req, res) => {
  let applications;
  try {
    applications = readCsv('applications.csv');
  } catch (e) {
    console.error('cannot read applications.csv:', e.message);
    res.sendStatus(500);
    return;
  }
  for (let i = 0; i < applications.length; i++) {
    handleApplicationDataRow2(con, applications[i]);
  }
  res.sendStatus(200);
}
