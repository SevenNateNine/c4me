let express = require('express');
let bp = require('body-parser');
let mysql = require('mysql');
let joi = require('@hapi/joi');
let fs = require('fs');
let student = require('./student');
let school = require('./school');
let highSchool = require('./high_school');
let application = require('./application');
let admin = require('./admin.js');
let user = require('./user.js');
let cors = require('cors');
let passport = require('passport');
let fileUpload = require('express-fileupload');
let https = require('https');

let sslKey = fs.readFileSync('../ssl/server.key');
let sslCert = fs.readFileSync('../ssl/server.cert');

let app = express();

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

app.use(bp.json());
app.use(passport.initialize());
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : 'tmp/'
}));

const PORT = config.port || 6789;
const SSL_PORT = config.sslPort || 6790;
const DB_HOST = config.host || 'localhost';
const DB_USER = config.user || 'root';  
const DB_PASS = config.pass || ''; 
const DB_NAME = config.db || 'c4me';
const SECRET = config.secret || 'very good secret'

const KEYS = config.keys || ['h026U8fpFjMyFr0qTpe6fvbk5Wg8ldutgVsIIbsZ3zTzuXNOP0B8NfnoKfoFeY3x']

app.use(cors());

let httpsServer = https.createServer({
  key: sslKey,
  cert: sslCert
}, app);

const pool = mysql.createPool({
  connectionLimit : 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

function reqResInt(req, res) {
//  res.header("Access-Control-Allow-Origin", FRONTEND_ADDR);
  if (!KEYS.includes(req.headers['x-key'])) {
    console.log(req.headers['x-key']);
    res.sendStatus(401);
    return false; 
  }
  return true;
}

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

user.passportSetup(databaseRequest, passport, SECRET);


function authenticate(req, res, type, func) {
  passport.authenticate('jwt', (err, user, info) => {
    if (err || !user || (user.type != type && type != 'Any')) {
      console.log(err? err : 'no result');
      res.status(401).send(err ? err : null);
    } else {
      console.log(user);
      func(req, res, user);
    }
  })(req, res);
}

function getToken(headers) {
  if (headers && headers.authorization) {
      console.log(headers.authorization);
      let parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else return null;
  } else return null;
}

// passport.authenticate('jwt', {session: false}),

app.get('/student', (req, res) => {
  //this will search the DB for this student and return the requisite data
  if (!reqResInt(req, res)) return;
authenticate(req, res, 'Any', (req, res, user) => {
    student.getProfile(databaseRequest, req, res);
  });
});

app.get('/me', (req, res) => { 
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    student.getMyProfile(databaseRequest, req, res, user.id);
  });
});

app.get('/school', (req, res) => {
  //search DB for school and return all data  
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    school.get(databaseRequest, req, res);
  });
});

app.get('/schoolList', (req, res) => {
  //search DB for school and return all data  
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    school.schoolList(databaseRequest, req, res);
  });
});

app.post('/user', (req, res) => {
  //this is where new users are created
  //validation of credentails (username does not exists, password valid) occurs here
  if (!reqResInt(req, res)) return;
  user.createAccount(databaseRequest, req, res);
});

app.put('/student', (req, res) => {
  //this for updating students
  //all data that is not null should be included in the body of the request
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    student.editProfile(databaseRequest, req, res, user.id);
  });
});

app.get('/search', (req, res) => {
  //search params are to be included as query data
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    school.search(databaseRequest, req, res);
  });
});

app.get('/scrape/:src', (req, res) => {
  //this is where admin scrape requests are recieved to.
  //the src specifies where to scrape from
  //any other requiste data should be in the query data
  if (!reqResInt(req, res)) return;
});

app.get('/ScrapeScoreCard', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.ScrapeFromScoreCardFile(databaseRequest, req, res);
  });
});

app.get('/scrapeCollegeRank', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.scrapeFromCollegeRank(databaseRequest, req, res); 
  });
});

app.get('/scrapeCollegeData', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.scrapeFromCollegeData(databaseRequest, req, res); 
  });
});

app.get('/search/rank', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    school.rank(databaseRequest, req, res, user.id);
  });
});

app.get('/highschoolByName', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    highSchool.highschoolByName(databaseRequest, req, res);
  });
})

app.get('/similarHS', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    highSchool.hsSimilar(databaseRequest, req, res);
  });
})

app.post('/application', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    application.createApplication(databaseRequest, req, res, user.id);
  });
});

app.put('/application', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    application.updateApplication(databaseRequest, req, res, user.id);
  });
});
app.get('/myApplications', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    application.getUserApplications(databaseRequest, req, res, user.id);
  });
});
app.put('/login', (req, res) => {
  //username and password validation. this should also create a cookie that will be sent
  //to the user by the react server. that cookie will then be sent back to this server
  //as query data to identify what user (student or admin) is performing the actions
  
  if (!reqResInt(req, res)) return;
  user.login(databaseRequest, req, res, passport, SECRET); //it needs a lot of shit
});

app.put('/logout', (req, res) => {
  if (!reqResInt(req, res)) return;
  passport.authenticate('jwt', (err, u, info) => {
    if (err || !u) {
      res.status(401).send(error);
    } else {
      user.logout(databaseRequest, req, res, u.id, u.random_val);
    }
  })(req, res);
});

app.get('/validate', (req, res) => {
  if (!reqResInt(req, res)) return;
  passport.authenticate('jwt', (err, u, info) => {
    if (err || !u) {
      res.status(401).send(err);
    } else {
      console.log(u);
      res.status(200).send({id: u.id, type: u.type});
    }
  })(req,res);
});

app.get('/application/questionablelist', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    application.getQuestionable(databaseRequest, req, res);
  });
});


app.get('/application/questionablelistAllData', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    application.getQuestionableAllData(databaseRequest, req, res);
  });
});

app.put('/application/validate', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    application.validate(databaseRequest, req, res);
  });
});

app.delete('/application', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    application.delete(databaseRequest, req, res);
  });
});

app.get('/schoolApplications', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    application.allApplicationsForSchool(databaseRequest, req, res);
  });
});


app.delete('/deleteAllStudents', (req, res) =>{
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.deleteAllStudents(databaseRequest, req, res);
  });
});

app.post('/importStudentTestData', (req, res) => {
  console.log('test');
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.pullFromStudentDataSet(databaseRequest, req, res);
  });
});

app.post('/importStudentData', (req, res) => {
  console.log('test');
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.pullFromStudentData(databaseRequest, req, res);
  });
});

app.post('/importApplicationData', (req, res) => {
  console.log('test');
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Admin', (req, res, user) => {
    admin.pullFromApplicationData(databaseRequest, req, res);
  });
});

app.get('/majorsList', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    school.majorsList(databaseRequest, req, res);
  });
});

app.post('/profileImage', (req, res) => {  
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Student', (req, res, user) => {
    student.setProfileImage(req, res, user.id); 
  });
});

app.get('/profileImage', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    student.getProfileImage(req, res);
  });
});

app.get('/hsList', (req, res) => {
  if (!reqResInt(req, res)) return;
  authenticate(req, res, 'Any', (req, res, user) => {
    highSchool.hsList(databaseRequest, req, res);
  });
});

const autocompleteSchema = joi.object({
  type: joi.string().max(1).min(1).token().required(),
  text: joi.string().max(255).token().required()

});

app.get('/autocomplete', (req, res) => {

  if (!reqResInt(req, res)) return;
  //not 100% sure we need this
  //meant to handle calculating similar name terms for different types of searches
  //type params determines if it's a search for a highschool or a university
  //the text being checked should be included in query data
  const {error, data} = autocompleteSchema.validate(req.query);
  if (error) {
    res.sendStatus(400);
    return;
  }
  if (req.query.type == 's') { //college name auto complete
    const t = `%${req.query.text}%`
    const query = `SELECT id, name FROM School WHERE name LIKE ${mysql.escape(t)}`
    console.log(query);
    databaseRequest(query, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).send(err);
        return;
      }
      res.send(data);
    });
  } else if (req.query.type == 'h') { //high school name auto complete

    const t = `%${req.query.text}%`
    const query = `SELECT id, name FROM HighSchool WHERE name LIKE ${mysql.escape(t)}`  
    databaseRequest(query, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).send(err);
        return;
      }
      res.send(data);
    });
  } else if (req.query.type == 'm') { //high school name auto complete

    const t = `%${req.query.text}%`
    const query = `SELECT name FROM Majors WHERE name LIKE ${mysql.escape(t)}`  
    databaseRequest(query, (err, data) => {
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
});

app.listen(PORT, '0.0.0.0', () => console.log(`http listening on port ${PORT}`));
httpsServer.listen(SSL_PORT, '0.0.0.0', () => console.log(`https listening on port ${SSL_PORT}`));
