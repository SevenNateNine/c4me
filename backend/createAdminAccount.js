// Creates an administrator account.
//
//   node createAdminAccount.js <username>
//
// The password is read from stdin, not from argv. Command-line arguments are
// visible to every other process on the machine via the process list and are
// recorded in shell history, so a password passed that way leaks twice over.

let user = require('./user.js');
let fs = require('fs');
let path = require('path');
let mysql = require('mysql2');
let readline = require('readline');

let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (e) {
  console.error('c4me: cannot read backend/config.json. Copy backend/config.example.json and fill it in.');
  process.exit(1);
}

const pool = mysql.createPool({
  connectionLimit: 5,
  host: config.host || 'localhost',
  user: config.user || 'root',
  password: config.pass || '',
  database: config.db || 'c4me',
});

function databaseRequest(query, values, func) {
  if (typeof values === 'function') {
    func = values;
    values = [];
  }
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

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({input: process.stdin, output: process.stdout, terminal: true});
    // Suppress echo so the password does not appear on screen or in a scrollback
    // buffer. The prompt itself still needs to be written once.
    let firstWrite = true;
    const output = rl.output;
    rl._writeToOutput = (str) => {
      if (firstWrite) {
        output.write(str);
        firstWrite = false;
      }
    };
    rl.question(question, (answer) => {
      output.write('\n');
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('usage: node createAdminAccount.js <username>');
    process.exit(1);
  }

  const pass = await promptHidden(`Password for admin "${name}": `);
  const confirm = await promptHidden('Confirm password: ');

  if (pass !== confirm) {
    console.error('Passwords did not match.');
    process.exit(1);
  }

  user.createAdmin(databaseRequest, {name, pass}, (err, id) => {
    if (err) {
      console.error(`Failed to create admin: ${err.message}`);
      pool.end();
      process.exit(1);
    }
    console.log(`Created admin "${name}" with id ${id}.`);
    pool.end();
  });
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
