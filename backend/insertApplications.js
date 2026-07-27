// One-off loader for applications.csv. The same work is available at runtime
// through the admin route POST /importApplicationData, which is the supported
// path; this script exists for bulk seeding without a running server.
//
//   node insertApplications.js

let fs = require('fs');
let path = require('path');
let mysql = require('mysql2');
let parse = require('csv-parse/sync').parse;

let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (e) {
  console.error('c4me: cannot read backend/config.json. Copy backend/config.example.json and fill it in.');
  process.exit(1);
}

const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.host || 'localhost',
  user: config.user || 'root',
  password: config.pass || '',
  database: config.db || 'c4me',
});

function databaseRequest(query, values, func) {
  pool.getConnection((err, connection) => {
    if (err) {
      func(err, null);
      return;
    }
    connection.query(query, values, (queryErr, rows) => {
      func(queryErr, rows);
      connection.release();
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

const applications = parse(fs.readFileSync(path.join(__dirname, 'applications.csv')),
  {columns: true, skip_empty_lines: true});

let pending = applications.length;
if (pending === 0) {
  pool.end();
}

for (let i = 0; i < applications.length; i++) {
  const row = applications[i];
  const status = STATUS_MAP[row.status] || '';

  // CSV cells are bound as parameters. The `questionable` column is left at its
  // default and computed by the application's own flagging logic — the original
  // seeded it from `Math.random() > 60`, which is never true.
  const query = `INSERT INTO Applications (student_id, college_id, status)
    SELECT User.id, School.id, ?
    FROM User, School
    WHERE User.user_name = ? AND School.name LIKE ?`;

  databaseRequest(query, [status, row.userid, row.college], (err) => {
    if (err) console.error(`row ${i}:`, err.code);
    if (--pending === 0) {
      pool.end();
    }
  });
}
