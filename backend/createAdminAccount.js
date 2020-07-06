let user = require('./user.js');
let fs = require('fs');
let mysql = require('mysql');

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

console.log(user.createAdmin(databaseRequest, {name: process.argv[2], pass: process.argv[3]}));
