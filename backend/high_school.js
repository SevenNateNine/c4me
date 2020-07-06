let joi = require('@hapi/joi');
let mysql = require('mysql');
let hsscraper = require('./hs_scraper.js');


const hsSchema = joi.object({
  name: joi.string().max(255).min(1).token(), 
  city: joi.string().max(255).min(1).token(),
  state: joi.string().min(2).max(2),
});

/*
  When student searches up a school and multiple options are returned:
    pick one of the options from a list
    ask the student before hand to pick location of where their high school is to narrow down options
*/
exports.highschoolByName = (con, res, id) => {  
  console.log(`highschool name: ${res.query.name}`);
  const query = mysql.format(`SELECT * FROM HighSchool WHERE name = ${req.query.name}`);
  con(query, (err, data) =>{
    if (err) {
      res.status(400).send(err);
    } 
    res.send(data);
  });
}

function simScore(score, newval, oldval) {
  var dif = 1-Math.abs((newval - oldval)/Math.abs(oldval))
  return dif < 0 ? 0 : score * dif
}

exports.hsSimilar = (con, req, res) => { 
  if(req.query.name == null || req.query.state == null || req.query.city == null){
    res.status(400).send(err);
  }
  const {error, value} = hsSchema.validate(req.query);
  if (error) {    
    res.status(400).send(error);
    console.log(error);
    return;
  }
  var highSchoolTag = (req.query.name.replace(/_/g,'-')+'-'+req.query.city.replace(/_/g,'-')+'-'+req.query.state).toLowerCase()
  console.log(highSchoolTag)
  /*
    takes the id for a highschool (determined using auto complete) and returns a list of
    similar highschools
  */
  hsscraper.scrape(highSchoolTag)
    .then(result =>{
        if(!Object.keys(result).length){
          res.send([])
        }
        else{
          simHSWrapper(con, result, res)
        }
    })
}

exports.insertHS = (con, highSchool, func) => {
  var highSchoolTag = (highSchool.name.replace(/ /g,'-')+'-'+highSchool.city.replace(/ /g,'-')+'-'+highSchool.state).toLowerCase()
  let query = `SELECT * FROM HighSchool WHERE name = ${mysql.escape(highSchool.name)} AND city = ${mysql.escape(highSchool.city)} AND state = ${mysql.escape(highSchool.state)}`
        con(query, (err, hsData) => {
          if(err) {
            console.log(err)
            func();
            return;
          }
          else if(hsData.length == 0){
            console.log('scraping from... ' + highSchoolTag)
            hsscraper.scrape(highSchoolTag)
            .then(result =>{
            query = `INSERT INTO HighSchool (name, city, state, ap_enroll, sat_score, act_score, interested_schools, interested_majors) VALUES (`
              query += result.name ? mysql.escape(result.name) : `null`
              query += `,`
              query += result.city ? mysql.escape(result.city) : `null`
              query += `,`
              query += result.state ? mysql.escape(result.state) : `null`
              query += `,`
              query += result.ap_enroll ? result.ap_enroll : `null`
              query += `,`
              query += result.sat_score ? result.sat_score : `null`
              query += `,`
              query += result.act_score ? result.act_score : `null`
              query += `,`
              query += result.colleges ? mysql.escape(result.colleges.toString()) : `null`
              query += `,`
              query += result.majors ? mysql.escape(result.majors.toString()) : `null`
              query += `)`
              con(query, (err, hsData) => {
                func();
                return;
              });
            });
          }
          else{
            func();
            return;
          }
        });
}

function simHSWrapper(con, highSchool, res){
  highSchool = highSchool
  console.log(highSchool)
  let query = `SELECT * FROM HighSchool WHERE name = ${mysql.escape(highSchool.name)} AND city = ${mysql.escape(highSchool.city)} AND state = ${mysql.escape(highSchool.state)}`
  con(query, (err, hsData) => {
    if(err){
      res.status(400).send(err)
      return;
    }
    else if(hsData.length == 0){
      query = `INSERT INTO HighSchool (name, city, state, ap_enroll, sat_score, act_score, interested_schools, interested_majors) VALUES (`
        query += highSchool.name ? mysql.escape(highSchool.name) : `null`
        query += `,`
        query += highSchool.city ? mysql.escape(highSchool.city) : `null`
        query += `,`
        query += highSchool.state ? mysql.escape(highSchool.state) : `null`
        query += `,`
        query += highSchool.ap_enroll ? highSchool.ap_enroll : `null`
        query += `,`
        query += highSchool.sat_score ? highSchool.sat_score : `null`
        query += `,`
        query += highSchool.act_score ? highSchool.act_score : `null`
        query += `,`
        query += highSchool.colleges ? mysql.escape(highSchool.colleges.toString()) : `null`
        query += `,`
        query += highSchool.majors ? mysql.escape(highSchool.majors.toString()) : `null`
        query += `)`
    }
    else{
      query = `UPDATE HighSchool SET `
        query += `name = ` 
        query += highSchool.name ? mysql.escape(highSchool.name) : `null`
        query += `,city = ` 
        query += highSchool.city ? mysql.escape(highSchool.city) : `null`
        query += `,state = ` 
        query += highSchool.state ? mysql.escape(highSchool.state) : `null`
        query += `,ap_enroll = ` 
        query += highSchool.ap_enroll ? highSchool.ap_enroll : `null`
        query += `,sat_score = ` 
        query += highSchool.sat_score ? highSchool.sat_score : `null`
        query += `,act_score = ` 
        query += highSchool.act_score ? highSchool.act_score : `null`
        query += `,interested_schools = ` 
        query += highSchool.colleges ? mysql.escape(highSchool.colleges.toString()) : `null`
        query += `,interested_majors = ` 
        query += highSchool.majors ? mysql.escape(highSchool.majors.toString()) : `null)`
        query += ` WHERE name = ${mysql.escape(highSchool.name)} AND city = ${mysql.escape(highSchool.city)} AND state = ${mysql.escape(highSchool.state)}`
    }
    console.log(query)
    con(query, (err, hsData) => {
      if(err){
        res.status(400).send(err)
        return;
      }
      query = `SELECT * FROM HighSchool WHERE name = ${mysql.escape(highSchool.name)} AND city = ${mysql.escape(highSchool.city)} AND state = ${mysql.escape(highSchool.state)}`
      con(query, (err, hsData) => {
        if(err || hsData.length <= 0){
          res.status(400).send(err)
          return;
        }
        similarHighSchoolAlgorithm(con, hsData[0], res);
      });
    });
  });
}

function similarHighSchoolAlgorithm(con, hs, res){
    /*
      Actual algorithm
    */
   let query = `SELECT * FROM HighSchool WHERE name <> ${mysql.escape(hs.name)} AND city <> ${mysql.escape(hs.city)} AND state <> ${mysql.escape(hs.state)} AND (`  // uncomment to not include the school being compared
   // let query = `SELECT * FROM HighSchool WHERE (`
   if(hs.sat_score){
     query += ` sat_score BETWEEN ${hs.sat_score} * .90 AND ${hs.sat_score} * 1.10 OR`
   }
   if(hs.act_score){
     query += ` act_score BETWEEN ${hs.act_score} * .90 AND ${hs.act_score} * 1.10 OR`
   }
   if(hs.ap_enroll){
     query += ` ap_enroll BETWEEN ${hs.ap_enroll} * .90 AND ${hs.ap_enroll} * 1.10 OR`
   }
   if(hs.sat_score || hs.act_score || hs.ap_enroll){
    query = query.substring(0, query.length - 3);
    query += ` )`
   }
   else{
    query = query.substring(0, query.length - 5);
   }
   console.log(query)
   con(query, (err, hsList) => {
     if (err) {
       console.log(err);
       res.status(400).send(err);
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

     var original_hsInterestedSchools = hs.interested_schools.split(',') // may have to change split based on scraper 
     var originalSchool_length = original_hsInterestedSchools.length
     var original_hsInterestedMajors = hs.interested_majors.split(',') // may have to change split based on scraper 
     var originalMajor_length = original_hsInterestedMajors.length

     for(let i = 0; i < hsList.length; i++) {
       let similarity = 0;

       // calculates individual similarity scores that'll be added as a whole and be used for determining highlights
       var sat_simScore = simScore(sat_weight, hsList[i].sat_score, hs.sat_score)
       var act_simScore = simScore(act_weight, hsList[i].act_score, hs.act_score)
       var ap_simScore = simScore(ap_weight, hsList[i].ap_enroll, hs.ap_enroll)
       var state_simScore = hsList[i].state === hs.state ? state_weight : 0

       // interested schools
       var interestedSchool_simScore = 0
       var current_hsInterestedSchools = hsList[i].interested_schools.split(',')
       for(let j = 0; j < current_hsInterestedSchools.length; j++){
         if(hs.interested_schools.includes(current_hsInterestedSchools[j]) != -1){
           interestedSchool_simScore += interestedSchool_weight/originalSchool_length
         }
       }

       // interested majors
       var interestedMajor_simScore = 0
       var current_hsInterestedMajors = hsList[i].interested_majors.split(',')
       for(let j = 0; j < current_hsInterestedMajors.length; j++){
         if(hs.interested_majors.includes(current_hsInterestedMajors[j]) != -1){
           interestedMajor_simScore += interestedMajor_weight/originalMajor_length
         }
       }

       // add them up
       similarity += sat_simScore + act_simScore + ap_simScore + state_simScore + interestedSchool_simScore + interestedMajor_simScore

       // highlights
       var highlights = []
       if(sat_simScore >= sat_weight*.85){
         highlights.push("sat")
       }
       if(act_simScore >= act_weight*.85){
         highlights.push("act")
       }
       if(ap_simScore >= ap_weight*.85){
         highlights.push("ap")
       }
       if(state_simScore == state_weight){
         highlights.push("state")
       }
       if(interestedSchool_simScore >= interestedSchool_weight*.85){
         highlights.push("school")
       }
       if(interestedMajor_simScore >= interestedMajor_weight*.85){
         highlights.push("major")
       }

       var similarity_report = {
         high_school: hsList[i],
         similarity_score: Math.round(similarity),
         highlights: highlights
       }
      //  console.log(similarity_report);
       results.push(similarity_report);
     }
     // sorts list by similarity score
     results.sort((a,b) => (a.similarity_score < b.similarity_score) ? 1 : -1)
     res.send(results);
   });
}

exports.hsList = (con, req, res) => {

  con('SELECT * FROM HighSchool', (err, data) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.send(data);
  });
}

