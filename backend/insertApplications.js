let fs = require('fs');
let mysql = require('mysql');
let parse = require('csv-parse/lib/sync');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const DB_HOST = config.host || 'localhost';
const DB_USER = config.user || 'root';  
const DB_PASS = config.pass || ''; 
const DB_NAME = config.db || 'c4me';

const pool = mysql.createPool({
  connectionLimit : 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

function databaseRequest(query, func) {
pool.getConnection((err, connection) => {
  if (err) {
    func(err, null);
  }
  connection.query(query, (err, rows) => {
    func(err, rows)
    connection.release();
  });
}); 
}

let fileData = fs.readFileSync('applications.csv');
let applications = parse(fileData, {columns: true, skip_empty_lines: true});
let i = 0
for (i = 0; i < applications.length; i++) {
  let row = applications[i];
  let status = "";
  let questionable = false;
  if (row.status === 'wait-listed') {
    status = 'Waitlisted';
  } else if (row.status === 'pending') {
    status = 'Pending';
  } else if (row.status === 'accepted') {
    status = 'Accepted';
    questionable = Math.random() > 60 ? true : false; 
  } else if (row.status === 'denied') {
    status = 'Rejected';
  } else if (row.status === 'deferred') {
    status = 'Deferred';
  }

  databaseRequest(`INSERT INTO Applications (student_id, college_id, questionable, status) SELECT 
  User.id, School.id, ${questionable}, ${mysql.escape(status)} FROM User, School WHERE 
  User.user_name = ${mysql.escape(row.userid)} AND School.name LIKE ${mysql.escape(row.college)}`, (err, rows) => {
    if (err) console.log(err);
    return;
  });
}
