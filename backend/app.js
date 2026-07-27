let express = require('express');
let bp = require('body-parser');
let mysql = require('mysql2');
let joi = require('joi');
let fs = require('fs');
let path = require('path');
let student = require('./student');
let school = require('./school');
let highSchool = require('./high_school');
let application = require('./application');
let admin = require('./admin.js');
let user = require('./user.js');
let cors = require('cors');
let helmet = require('helmet');
let rateLimit = require('express-rate-limit');
let passport = require('passport');
let fileUpload = require('express-fileupload');
let https = require('https');

function fatal(message) {
  console.error(`c4me: ${message}`);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch (e) {
  fatal('cannot read backend/config.json. Copy backend/config.example.json to backend/config.json and fill it in.');
}

// Secrets have no built-in fallback on purpose. A default that ships in the
// repository is a publicly known default, and a deployment that forgets to
// override it would be signing tokens anyone can forge.
function requiredSecret(name) {
  const value = config[name];
  if (typeof value !== 'string' || value.length < 32 || value.startsWith('CHANGE_ME')) {
    fatal(`config.${name} must be set to at least 32 characters of random data. ` +
      `Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`);
  }
  return value;
}

const SECRET = requiredSecret('secret');

const KEYS = config.keys;
if (!Array.isArray(KEYS) || KEYS.length === 0 || KEYS.some(k => typeof k !== 'string' || k.length < 16 || k.startsWith('CHANGE_ME'))) {
  fatal('config.keys must be a non-empty array of random strings of at least 16 characters.');
}

const ALLOWED_ORIGINS = Array.isArray(config.allowedOrigins) ? config.allowedOrigins : [];
if (ALLOWED_ORIGINS.length === 0) {
  fatal('config.allowedOrigins must list the exact origins allowed to call this API, e.g. ["https://localhost:3000"].');
}

const SSL_PORT = config.sslPort || 6790;
const DB_HOST = config.host || 'localhost';
const DB_USER = config.user || 'root';
const DB_PASS = config.pass || '';
const DB_NAME = config.db || 'c4me';

const SSL_DIR = path.join(__dirname, '..', 'ssl');
let sslKey, sslCert;
try {
  sslKey = fs.readFileSync(path.join(SSL_DIR, 'server.key'));
  sslCert = fs.readFileSync(path.join(SSL_DIR, 'server.cert'));
} catch (e) {
  fatal('cannot read ssl/server.key and ssl/server.cert. Generate them with: sh ssl/generate-cert.sh');
}

let app = express();

app.use(helmet());

// An allowlist, not a wildcard. app.use(cors()) reflects any origin, which lets
// any site on the internet issue credentialed requests against this API.
app.use(cors({
  origin: (origin, callback) => {
    // Same-origin and non-browser clients send no Origin header.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    // Withhold the header rather than raising: an Error here surfaces as a 500
    // from the error handler, which misreports a refused origin as a server
    // fault. With no Access-Control-Allow-Origin the browser blocks the
    // response, which is what actually enforces CORS.
    return callback(null, false);
  },
  credentials: true
}));

app.use(bp.json({limit: '100kb'}));
app.use(passport.initialize());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'tmp'),
  limits: {fileSize: 5 * 1024 * 1024, files: 1},
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: 4
}));

// The x-key header is a deployment gate that keeps stray clients off the API.
// It is not an authentication control: the frontend ships it in a browser
// bundle, so its users can read it. Authorization comes from the JWT below.
// Applied globally so a new route is closed by default rather than open until
// somebody remembers to add the check.
app.use((req, res, next) => {
  if (!KEYS.includes(req.headers['x-key'])) {
    return res.sendStatus(401);
  }
  next();
});

// Credential endpoints are the ones worth guessing at, so they get their own
// budget on top of the global limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {success: false}
});

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false
}));

let httpsServer = https.createServer({
  key: sslKey,
  cert: sslCert
}, app);

const pool = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

function databaseRequest(query, values, func) {
  // Callers may omit `values` for statements with no placeholders.
  if (typeof values === 'function') {
    func = values;
    values = [];
  }
  pool.getConnection((err, connection) => {
    if (err) {
      func(err, null);
      return; // without this the next line dereferences a null connection
    }
    connection.query(query, values, (queryErr, rows) => {
      func(queryErr, rows);
      connection.release();
    });
  });
}

user.passportSetup(databaseRequest, passport, SECRET);

function authenticate(req, res, type, func) {
  passport.authenticate('jwt', {session: false}, (err, u, info) => {
    if (err || !u || (u.type != type && type != 'Any')) {
      return res.sendStatus(401);
    }
    func(req, res, u);
  })(req, res);
}

app.get('/student', (req, res) => {
  //this will search the DB for this student and return the requisite data
  authenticate(req, res, 'Any', (req, res, user) => {
    student.getProfile(databaseRequest, req, res);
  });
});

app.get('/me', (req, res) => {
  authenticate(req, res, 'Student', (req, res, user) => {
    student.getMyProfile(databaseRequest, req, res, user.id);
  });
});

app.get('/school', (req, res) => {
  //search DB for school and return all data
  authenticate(req, res, 'Any', (req, res, user) => {
    school.get(databaseRequest, req, res);
  });
});

app.get('/schoolList', (req, res) => {
  //search DB for school and return all data
  authenticate(req, res, 'Any', (req, res, user) => {
    school.schoolList(databaseRequest, req, res);
  });
});

app.post('/user', authLimiter, (req, res) => {
  //this is where new users are created
  //validation of credentails (username does not exists, password valid) occurs here
  user.createAccount(databaseRequest, req, res);
});

app.put('/student', (req, res) => {
  //this for updating students
  //all data that is not null should be included in the body of the request
  authenticate(req, res, 'Student', (req, res, user) => {
    student.editProfile(databaseRequest, req, res, user.id);
  });
});

app.get('/search', (req, res) => {
  //search params are to be included as query data
  authenticate(req, res, 'Any', (req, res, user) => {
    school.search(databaseRequest, req, res);
  });
});

app.get('/ScrapeScoreCard', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.ScrapeFromScoreCardFile(databaseRequest, req, res);
  });
});

app.get('/scrapeCollegeRank', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.scrapeFromCollegeRank(databaseRequest, req, res);
  });
});

app.get('/scrapeCollegeData', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.scrapeFromCollegeData(databaseRequest, req, res);
  });
});

app.get('/search/rank', (req, res) => {
  authenticate(req, res, 'Student', (req, res, user) => {
    school.rank(databaseRequest, req, res, user.id);
  });
});

app.get('/highschoolByName', (req, res) => {
  authenticate(req, res, 'Any', (req, res, user) => {
    highSchool.highschoolByName(databaseRequest, req, res);
  });
})

app.get('/similarHS', (req, res) => {
  authenticate(req, res, 'Any', (req, res, user) => {
    highSchool.hsSimilar(databaseRequest, req, res);
  });
})

app.post('/application', (req, res) => {
  authenticate(req, res, 'Student', (req, res, user) => {
    application.createApplication(databaseRequest, req, res, user.id);
  });
});

app.put('/application', (req, res) => {
  authenticate(req, res, 'Student', (req, res, user) => {
    application.updateApplication(databaseRequest, req, res, user.id);
  });
});

app.get('/myApplications', (req, res) => {
  authenticate(req, res, 'Student', (req, res, user) => {
    application.getUserApplications(databaseRequest, req, res, user.id);
  });
});

app.put('/login', authLimiter, (req, res) => {
  //username and password validation. this should also create a cookie that will be sent
  //to the user by the react server. that cookie will then be sent back to this server
  //as query data to identify what user (student or admin) is performing the actions
  user.login(databaseRequest, req, res, passport, SECRET);
});

app.put('/logout', (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, u, info) => {
    if (err || !u) {
      return res.sendStatus(401);
    }
    user.logout(databaseRequest, req, res, u.id, u.random_val);
  })(req, res);
});

app.get('/validate', (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, u, info) => {
    if (err || !u) {
      return res.sendStatus(401);
    }
    res.status(200).send({id: u.id, type: u.type});
  })(req, res);
});

app.get('/application/questionablelist', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    application.getQuestionable(databaseRequest, req, res);
  });
});

app.get('/application/questionablelistAllData', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    application.getQuestionableAllData(databaseRequest, req, res);
  });
});

app.put('/application/validate', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    application.validate(databaseRequest, req, res);
  });
});

// Admin, not 'Any'. This handler takes student_id from the request body, so
// under 'Any' any logged-in student could delete any other student's
// application by guessing an id.
app.delete('/application', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    application.delete(databaseRequest, req, res);
  });
});

app.get('/schoolApplications', (req, res) => {
  authenticate(req, res, 'Student', (req, res, user) => {
    application.allApplicationsForSchool(databaseRequest, req, res);
  });
});

app.delete('/deleteAllStudents', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.deleteAllStudents(databaseRequest, req, res);
  });
});

app.post('/importStudentTestData', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.pullFromStudentDataSet(databaseRequest, req, res);
  });
});

app.post('/importStudentData', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.pullFromStudentData(databaseRequest, req, res);
  });
});

app.post('/importApplicationData', (req, res) => {
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.pullFromApplicationData(databaseRequest, req, res);
  });
});

app.get('/majorsList', (req, res) => {
  authenticate(req, res, 'Any', (req, res, user) => {
    school.majorsList(databaseRequest, req, res);
  });
});

app.post('/profileImage', (req, res) => {
  authenticate(req, res, 'Student', (req, res, user) => {
    student.setProfileImage(req, res, user.id);
  });
});

app.get('/profileImage', (req, res) => {
  authenticate(req, res, 'Any', (req, res, user) => {
    student.getProfileImage(req, res);
  });
});

app.get('/hsList', (req, res) => {
  authenticate(req, res, 'Any', (req, res, user) => {
    highSchool.hsList(databaseRequest, req, res);
  });
});

const autocompleteSchema = joi.object({
  type: joi.string().max(1).min(1).token().required(),
  text: joi.string().max(255).token().required()
});

const AUTOCOMPLETE_QUERIES = {
  's': 'SELECT id, name FROM School WHERE name LIKE ?',        //college name auto complete
  'h': 'SELECT id, name FROM HighSchool WHERE name LIKE ?',    //high school name auto complete
  'm': 'SELECT name FROM Majors WHERE name LIKE ?'             //major name auto complete
};

app.get('/autocomplete', (req, res) => {
  //meant to handle calculating similar name terms for different types of searches
  //type params determines if it's a search for a highschool or a university
  //the text being checked should be included in query data
  const {error} = autocompleteSchema.validate(req.query);
  if (error) {
    res.sendStatus(400);
    return;
  }
  const query = AUTOCOMPLETE_QUERIES[req.query.type];
  if (!query) {
    res.sendStatus(400);
    return;
  }
  databaseRequest(query, [`%${req.query.text}%`], (err, data) => {
    if (err) {
      console.error('autocomplete query failed:', err.code);
      res.sendStatus(500);
      return;
    }
    res.send(data);
  });
});

// Anything that escapes a route handler lands here. Send a status, never the
// error itself — driver errors carry table names, column names and SQL text.
app.use((err, req, res, next) => {
  console.error('unhandled error:', err && err.message);
  if (res.headersSent) {
    return next(err);
  }
  res.sendStatus(500);
});

// HTTPS only. The previous plaintext listener served the same authenticated API
// on a second port, so every JWT and password sent to it crossed the network in
// the clear regardless of the TLS server running beside it.
httpsServer.listen(SSL_PORT, '0.0.0.0', () => console.log(`https listening on port ${SSL_PORT}`));
