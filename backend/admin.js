let mysql = require('mysql');
let joi = require('@hapi/joi');
let fs = require('fs');
let csv = require('fast-csv');
let https = require('https');
let cdscraper = require('./cd_scraper.js');
let crscraper = require('./cr_scraper.js');
let user = require('./user.js');
let application = require('./application.js');
let parse = require('csv-parse/lib/sync');
let eol = require('os').EOL;
let highSchool = require('./high_school.js');

exports.deleteAllStudents = (con, req, res) => {
  console.log(`delete all applications`);
  const query1 = mysql.format(`DELETE FROM Applications;`);
  con(query1, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return
    }
  });

  console.log(`delete all students`);
  const query2 = mysql.format(`DELETE FROM Student;`);
  con(query2, (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return
    }
    res.send(data)
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

function handleScoreCardRow(con, row, list) {
  let name = getProperName(row.INSTNM, list);
  if (!name) return;
  if (row.ADM_RATE === 'NULL' || row.ADMIN === 'PrivacySuppressed') {
    row.ADM_RATE = null;
  }
  if (row.COSTT4_A === 'NULL' || row.COSTT4_A === 'PrivacySuppressed') {
    row.COSTT4_A = null;
  }
  if (row.OVERALL_YR4_N === 'NULL' || row.OVERALL_YR4_N === 'PrivacySuppressed') {
    row.OVERALL_YR4_N = null;
  }if (row.ACTCMMID === 'NULL' || row.ACTCMMID === 'PrivacySuppressed') {
    row.ACTCMMID = null;
  }if (row.SATMTMID === 'NULL' || row.SATMTMID === 'PrivacySuppressed') {
    row.SATMTMID = null;
  }if (row.SATVRMID === 'NULL' || row.SATVRMID === 'PrivacySuppressed') {
    row.SATVRMID = null;
  }if (row.SATMT25 === 'NULL' || row.SATMT25 === 'PrivacySuppressed') {
    row.SATMT25 = null;
  }if (row.SATMT75 === 'NULL' || row.SATMT75 === 'PrivacySuppressed') {
    row.SATMT75 = null;
  }if (row.SATVR25 === 'NULL' || row.SATVR25  === 'PrivacySuppressed') {
    row.SATVR25 = null;
  }if (row.SATVR75 === 'NULL' || row.SATVR75 === 'PrivacySuppressed') {
    row.SATVR75 = null;
  }if (row.ACTCM25 === 'NULL' || row.ACTCM25 === 'PrivacySuppressed') {
    row.ACTCM25 = null;
  }if (row.ACTCM75 === 'NULL' || row.ACTCM75 === 'PrivacySuppressed') {
    row.ACTCM75 = null;
  }
  let query = `INSERT INTO School (name, city, state, region, admission_rate, cost, size, 
    act_composite, sat_math, sat_ebrw, sat_math_range_low, sat_math_range_high, 
    sat_ebrw_range_low, sat_ebrw_range_high, act_range_low, act_range_high) VALUES 
  (${mysql.escape(name)}, ${mysql.escape(row.CITY)}, ${mysql.escape(row.STABBR)}, ${mysql.escape(selectRegion(row.STABBR))}, 
    ${row.ADM_RATE * 100}, ${row.COSTT4_A}, ${row.OVERALL_YR4_N}, ${row.ACTCMMID}, ${row.SATMTMID}, 
    ${row.SATVRMID}, ${row.SATMT25}, ${row.SATMT75}, ${row.SATVR25}, 
    ${row.SATVR75}, ${row.ACTCM25}, ${row.ACTCM75}) ON DUPLICATE KEY UPDATE name = ${mysql.escape(name)}, 
    city = ${mysql.escape(row.CITY)}, state = ${mysql.escape(row.STABBR)}, admission_rate = ${row.ADM_RATE*100}, 
    cost = ${row.COSTT4_A}, size = ${row.OVERALL_YR4_N}, act_composite = ${row.ACTCMMID}, 
    sat_math = ${row.SATMTMID}, sat_ebrw = ${row.SATVRMID}, sat_math_range_low = ${row.SATMT25}, 
    sat_math_range_high = ${row.SATMT75}, sat_ebrw_range_low = ${row.SATVR25}, sat_ebrw_range_high = ${row.SATVR75}, 
    act_range_low = ${row.ACTCM25}, act_range_high = ${row.ACTCM75}`;
  con(query, (err, data) => {
    if (err) console.log(err);
  });
}

exports.ScrapeFromScoreCardFile = (con, req, res) => {
  console.log('scrape from score card inititiated');
  var collegeList = null;
  try {
    collegeList = fs.readFileSync('colleges.txt', 'utf8');
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
    return;
  }
  collegeList = collegeList.split(eol);
  var f = fs.createWriteStream('CollegeScoreCard.csv');
  var request = https.get('https://ed-public-download.app.cloud.gov/downloads/Most-Recent-Cohorts-All-Data-Elements.csv', 
    (res2) => {
    res2.pipe(f);
    f.on('finish', () => {
      console.log('finished downloading scorecard')
      f.close();
      var f2 = fs.createReadStream('CollegeScoreCard.csv')
        .pipe(csv.parse({headers: true}))
        .on('error', error => console.error(error))
        .on('data', row => handleScoreCardRow(con, row, collegeList))
        .on('end', rowCount => console.log(`Parsed ${rowCount} rows`));
      fs.unlink('CollegeScoreCard.csv', (err) => {
        if (err) console.log(err);
        else console.log('deleted score card');
      });
      res.sendStatus(200);
    });
  }); 
}

function handleCollegeRank(con, req, res){
  let query = `INSERT INTO School(name, ranking) VALUES`
  for(i = 0; i < req.length; i++){
    query += ` (${mysql.escape(req[i].name)}, ${req[i].rank}),`
  }
  query = query.substring(0, query.length - 1);
  query += ` ON DUPLICATE KEY UPDATE name = VALUES(name), ranking = VALUES(ranking)`
  console.log(query)
  con(query, (err, data) => {
    if(err) console.log(err);
  });
}

exports.scrapeFromCollegeRank = (con, req, res) => {
  crscraper.scrape().then(result=>{
    if(!Object.keys(result).length){
      res.send([])
    }
    else{
      handleCollegeRank(con, result, res);
      res.sendStatus(200);
    }
  })
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

function handleCollegeData(con, req, res){  
  let query = `INSERT INTO School 
    (name, city, state, admission_rate, cost, size, 
      act_composite, sat_math, sat_ebrw, act_range_low, 
      act_range_high, sat_math_range_low, sat_math_range_high, 
      sat_ebrw_range_low, sat_ebrw_range_high, avg_accepted_gpa, region
    ) VALUES`
  for(i = 0; i < req.length; i++){
    let stateRegion = selectRegion(req[i].state)
    query += ` (
      ${mysql.escape(req[i].name)}, ${mysql.escape(req[i].city)}, ${mysql.escape(req[i].state)},
      ${req[i].admission_rate}, ${req[i].cost}, ${req[i].size}, ${req[i].act_composite}, 
      ${req[i].sat_math}, ${req[i].sat_ebrw}, ${req[i].act_low}, ${req[i].act_high}, 
      ${req[i].math_low}, ${req[i].math_high}, ${req[i].ebrw_low}, ${req[i].ebrw_high},
      ${req[i].avgGPA}, ${mysql.escape(stateRegion)}
      ),`
  }
  query = query.substring(0, query.length - 1)
  query += ` ON DUPLICATE KEY UPDATE name = VALUES(name),
    city = VALUES(city),
    state = VALUES(state),
    admission_rate = VALUES(admission_rate),
    cost = VALUES(cost),
    size = VALUES(size),
    act_composite = VALUES(act_composite),
    sat_math = VALUES(sat_math),
    sat_ebrw = VALUES(sat_ebrw),
    act_range_low = VALUES(act_range_low),
    act_range_high = VALUES(act_range_high),
    sat_math_range_low = VALUES(sat_math_range_low),
    sat_math_range_high = VALUES(sat_math_range_high),
    sat_ebrw_range_low = VALUES(sat_ebrw_range_low),
    sat_ebrw_range_high = VALUES(sat_ebrw_range_high),
    avg_accepted_gpa = VALUES(avg_accepted_gpa),
    region = VALUES(region)
    `
  // console.log(query)
  con(query, (err, data) => {
    if(err) console.log(err);
  });
}

function handleMajorData(con, req, res){
  let query = `INSERT INTO Majors (school_id, major) VALUES`
  for(i = 0; i < req.length; i++){
    if("majors" in req[i]){
      for(j = 0; j < req[i].majors.length; j++){
        query += ` (
          (SELECT id FROM School WHERE School.name = ${mysql.escape(req[i].name)} LIMIT 1),
          ${mysql.escape(req[i].majors[j])}
        ),`
      }
    }
  }
  query = query.substring(0, query.length - 1)
  query += ` ON DUPLICATE KEY UPDATE major = VALUES(major)`
  // console.log(query)
  con(query, (err, data) => {
    if(err) console.log(err);
  });
}

exports.scrapeFromCollegeData = (con, req, res) => {
  console.log("Starting CollegeData scrape...")
  cdscraper.scrape().then(result=>{
    if(!Object.keys(result).length){
      res.send([])
    }
    else{
      handleCollegeData(con, result, res);
      handleMajorData(con, result, res);
      console.log("Majors and Colleges are handled")
      res.sendStatus(200)
    }
  })
}


function handleStudentDataRow(con, rows, callback, i) {
    if (i >= rows.length) return;
    let row = rows[i];
    highSchool.insertHS(con, {name: row['high_school_name'], city: row['high_school_city'], state: row['high_school_state']}, () =>{
      user.passwordHash(row['password'], (hashError, hash) => {
        if (hashError) {
          console.log(hashError);
          return;
        }
        let query2 = `REPLACE INTO User (user_name, password, type) 
        VALUES (${mysql.escape(row.userid)}, ${mysql.escape(hash)}, 'Student')`;
        con(query2, (error2, rows2) => {
          if (error2) {
            console.log(error2);
            return;
          }
          let query3 = `INSERT INTO Student (id, hs_id, major1, major2, grad_year, sat_math, 
            sat_ebrw, act_eng, act_math, act_reading, act_science, act_comp, sat_lit, sat_us, 
            sat_mathI, sat_mathII, sat_eco, sat_mol, sat_chem, sat_phy, numAPs, gpa) 
            SELECT ${rows2.insertId}, id, 
            ${row.major_1 == '' ? null : mysql.escape(row.major_1)}, 
            ${row.major_2 == '' ? null : mysql.escape(row.major_2)}, 
            ${row['college_class'] = '' ? null : row['college_class']}, 
            ${row['SAT_math'] == '' ? null : row['SAT_math']}, 
            ${row['SAT_EBRW'] == '' ? null : row['SAT_EBRW']}, 
            ${row['ACT_English'] == '' ? null : row['ACT_English']}, 
            ${row['ACT_math'] == '' ? null : row['ACT_math']}, 
            ${row['ACT_reading'] == '' ? null : row['ACT_reading']}, 
            ${row['ACT_science'] == '' ? null : row['ACT_science']}, 
            ${row['ACT_composite'] == '' ? null : row['ACT_composite']}, 
            ${row['SAT_literature'] == '' ? null : row['SAT_literature']}, 
            ${row['SAT_US_hist'] == '' ? null : row['SAT_US_hist']}, 
            ${row['SAT_math_I'] == '' ? null : row['SAT_math_I']}, 
            ${row['SAT_math_II'] == '' ? null : row['SAT_math_II']}, 
            ${row['SAT_eco_bio'] == '' ? null : row['SAT_eco_bio']}, 
            ${row['SAT_mol_bio'] == '' ? null : row['SAT_mol_bio']}, 
            ${row['SAT_chemistry'] == '' ? null : row['SAT_chemistry']}, 
            ${row['SAT_physics'] == '' ? null : row['SAT_physics']}, 
            ${row['num_AP_passed'] == '' ? null : row['num_AP_passed']}, 
            ${row['GPA'] == '' ? null : row['GPA']} FROM HighSchool WHERE 
            name = ${mysql.escape(row['high_school_name'])} 
            AND city = ${mysql.escape(row['high_school_city'])} 
            AND state = ${mysql.escape(row['high_school_state'])}`;
          con(query3, (error3, row3) => {
            if (error3) {
              console.log(error3);
              return;
            }
            callback(rows2.insertId, row.userid);
            handleStudentDataRow(con, rows, callback, i + 1);
          });
        });
      });
    });
}
function handleApplicationDataRow(con, id, row) {
  let status = '';
  if (row.status === 'wait-listed') {
    status = 'Waitlisted';
  } else if (row.status === 'pending') {
    status = 'Pending';
  } else if (row.status === 'accepted') {
    status = 'Accepted';
  } else if (row.status === 'denied') {
    status = 'Rejected';
  } else if (row.status === 'deferred') {
    status = 'Deferred';
  }
  con(`SELECT School.id as college_id FROM School WHERE School.name = ${mysql.escape(row.college)}`, 
    (error, result) => {
    if (error || !result || result.length === 0) {
      console.log(row.college)
      return;
    }
    application.insertApplication(con, id, result[0].college_id, status); 
  });
}

function handleApplicationDataRow2(con, row) {
  let status = '';
  if (row.status === 'wait-listed') {
    status = 'Waitlisted';
  } else if (row.status === 'pending') {
    status = 'Pending';
  } else if (row.status === 'accepted') {
    status = 'Accepted';
  } else if (row.status === 'denied') {
    status = 'Rejected';
  } else if (row.status === 'deferred') {
    status = 'Deferred';
  }
  con(`SELECT School.id as college_id AND User.id as student.id as student_id FROM School, User 
    WHERE School.name = ${mysql.escape(row.college)} AND User.user_name = ${mysql.escape(row.userid)}`, 
    (error, result) => {
    if (error || !result || result.length === 0) {
      return;
    }
    application.insertApplication(con, id, result[0].college_id, result[0].student_id, status); 
  });
}
exports.pullFromStudentDataSet = (con, req, res) => {
//  let studentFile = fs.createReadStream('students-1.csv')
//  .pipe(csv.parse({headers: true}))
//  .on('error', error => res.status(500).send(error))
// .on('data', row => handleStudentDataRow(con, row))
//  .on('finish', rowCount => {
//    console.log(`Parsed ${rowCount} student rows`);
//
//    let majorFile = fs.createReadStream('applications-1.csv')
//    .pipe(csv.parse({headers: true}))
//    .on('error', error => res.status(500).send(error))
//   .on('data', row => handleApplicationDataRow(con, row))
//    .on('end', rowCount => {
//      console.log(`Parsed ${rowCount} application rows`);  
//      res.sendStatus(200); 
//    });
//  });
  console.log('pulling from files:');
  let fileData1 = fs.readFileSync('students.csv'); 
  let students = parse(fileData1, {columns: true, skip_empty_lines: true});
  let fileData2 = fs.readFileSync('applications.csv');
  let applications = parse(fileData2, {columns: true, skip_empty_lines: true});
  
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
  let fileData1 = fs.readFileSync('students.csv'); 
  let students = parse(fileData1, {columns: true, skip_empty_lines: true});
  
  handleStudentDataRow(con, students, (id, name) => {}, 0);
  res.sendStatus(200);
}

exports.pullFromApplicationData = (con, req, res) => {
  let fileData2 = fs.readFileSync('applications.csv');
  let applications = parse(fileData2, {columns: true, skip_empty_lines: true});
  for (let i = 0; i < applications.length; i++) {
    handleApplicationDataRow2(con, applications[i]);
  }
  res.sendStatus(200);
}
