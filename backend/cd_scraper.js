const puppeteer=require('puppeteer');
let fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const colleges = fs.readFileSync('colleges.txt', 'utf8')

// "collegedatasite": "http://allv22.all.cs.stonybrook.edu/~stoller/cse416/collegedata/"
// "collegedatasite": "https://www.collegedata.com/college/"


async function scrape(){
  const browser = await puppeteer.launch({headless: true}); //debugging purposes - shouldn't be false in practice
  const page = await browser.newPage();

  let dataArray = []
  let collegeList = colleges.replace(/\r/g,'').split('\n')
  for(i = 0; i < collegeList.length-1; i++){
    var currentCollege = collegeList[i]
    var searchedCollege = currentCollege
    let collegeNameArray = [];
    if(currentCollege.includes("University of Maryland")){  //hardcode plEase
      searchedCollege = currentCollege.split(",")[0]
    }
    else if(currentCollege.includes("Washington & Jefferson College")){
      searchedCollege = "Washington Jefferson College"
    }
    else if(currentCollege.includes("Williams College")){
      searchedCollege = "Williams College"
    }
    else if(currentCollege.includes("William & Mary")){
      searchedCollege = "College of William and Mary"
    }
    else if(currentCollege.includes("SUNY College of Environmental Science and Forestry")){
      searchedCollege = "State University of New York College of Environmental Science and Forestry"
    }
    else if(currentCollege.includes("The College of St Scholastica")){
      searchedCollege = "College-of-St-Scholastica"
    }
    else if(currentCollege.includes("The College of Wooster")){
      searchedCollege = "College of Wooster"
    }
    else if(currentCollege.includes("Franklin & Marshall College")){
      searchedCollege = "Franklin Marshall College"
    }
    if(currentCollege.includes("University of Wisconsin-Madison") || currentCollege.includes("University of Illinois at Urbana-Champaign")){
      collegeNameArray.push(searchedCollege)
    }
    else{ collegeNameArray = searchedCollege.split("-") }
    url = config.collegedatasite + (collegeNameArray[0].replace(/\s/g, '-').replace("&", '-').replace(/,/g,'').replace("-(Main-campus)",''));

    await page.goto(url,{
      waitLoad: true,
      waitNetworkIdle: true
    });
    let data = await page.evaluate(async () => {
      var fourohfour = await document.querySelector("body > h1");
      if(fourohfour !== null){
        if(fourohfour.innerText.includes("Not Found")){
          return
        }
      }
      var mainsite404 = await document.querySelector("#college-match-search > div:nth-child(2) > div > div > span.field-validation-error");
      if(mainsite404 !== null){
        return 
      }
      var isMirror = 1;
      var res = {}
      var name = await document.querySelector("#mainContent");
      res.name = name.innerText;
      
      var location = await document.querySelector("#main > div.container-fluid > div > div.col-lg-8 > p")
      if(location){
        var loc_split = location.innerText.split(',');
        res.city = loc_split[0].trim()
        res.state = loc_split[1].trim()
      }
      
      var admission_rate = await document.querySelector("#profile-overview > div:nth-child(4) > div > dl:nth-child(2) > dd:nth-child(4)")
      if(admission_rate){
        adminRateText = admission_rate.innerText
        res.admission_rate = parseInt(adminRateText.substring(0, adminRateText.indexOf('%')))
      }
  
      var cost = await document.querySelector("#profile-overview > div:nth-child(5) > div > dl > dd:nth-child(2)");
      if(cost){
        var costText = cost.innerText.split('\n');
        res.cost = parseInt(costText[0].replace(/\D/g,'')); // instate, get average instead?
      }
      
      var undergrad = await document.querySelector("#profile-overview > div.statbar > div:nth-child(3) > div > span.h2");
      if(!undergrad){
        undergrad = await document.querySelector("#profile-overview > div.statbar > div:nth-child(2) > div > span.h2");
        isMirror = 0;
      }
      var grad = await document.querySelector("#profile-overview > div.statbar > div:nth-child(5) > div > div > div > span.h2");
      var undergradNum = 0;
      var gradNum = 0;
      if(undergrad){
        var undergradText = undergrad.innerText.replace(/\D/g,'')
        if(undergradText !== ''){
          undergradNum = parseInt(undergradText);
        }
      }
      if(grad){
        var gradText = grad.innerText.replace(/\D/g,'');
        if(gradText !== ''){
          gradNum = parseInt(gradText);
        }
      }
      res.size = undergradNum + gradNum
    
      var hilo;
      var act_compText;
      var sat_mathText;
      var sat_ebrwText;

      var act_comp = await document.querySelector("#profile-admission > div:nth-child(4) > div > dl:nth-child(9) > dd:nth-child(2)");
      if(!act_comp){
        act_comp = await document.querySelector("#profile-overview > div:nth-child(4) > div > dl:nth-child(4) > dd:nth-child(8)");
        isMirror = 0;
      }
      if(act_comp){
        act_compText = act_comp.innerText.split('\n');
        if(act_compText.length > 1){
          res.act_composite = parseInt(act_compText[0].replace(/\D/g,''));
        }
        else{
          hilo = act_compText[0].split(' ')[0].split('-')
          res.act_composite = Math.round((parseInt(hilo[0]) + parseInt(hilo[1]))/2)
        }
      }
  
      var sat_math = await document.querySelector("#profile-admission > div:nth-child(4) > div > dl:nth-child(7) > dd:nth-child(2)");
      if(!sat_math){
        sat_math = await document.querySelector("#profile-overview > div:nth-child(4) > div > dl:nth-child(4) > dd:nth-child(4)")
        isMirror = 0;
      }
      if(sat_math){
        sat_mathText = sat_math.innerText.split('\n');
        if(sat_mathText.length > 1){
          res.sat_math = parseInt(sat_mathText[0].replace(/\D/g,''));
        }
        else{
          hilo = sat_mathText[0].split(' ')[0].split('-')
          res.sat_math = Math.round((parseInt(hilo[0]) + parseInt(hilo[1]))/2)
        }
      }
  
      var sat_ebrw = await document.querySelector("#profile-admission > div:nth-child(4) > div > dl:nth-child(7) > dd:nth-child(16)");
      if(!sat_ebrw){
        sat_ebrw = await document.querySelector("#profile-overview > div:nth-child(4) > div > dl:nth-child(4) > dd:nth-child(6)");
        isMirror = 0;
      }
      if(sat_ebrw){
        sat_ebrwText = sat_ebrw.innerText.split('\n');
        if(sat_ebrwText.length > 1){
          res.sat_ebrw = parseInt(sat_ebrwText[0].replace(/\D/g,''));
        }
        else{
          hilo = sat_ebrwText[0].split(' ')[0].split('-')
          res.sat_ebrw = Math.round((parseInt(hilo[0]) + parseInt(hilo[1]))/2)
        }
      }
  
      // ranges are taken from previously existing var
      var i = 0
      if(act_comp){
        if(act_compText){
          if(act_compText.length > 1){ 
            i = 1 
          }
          else{ i = 0 }
          hilo = act_compText[i].split(' ')[0].split('-');
          res.act_low = parseInt(hilo[0]);
          res.act_high = parseInt(hilo[1]);
        }
      }
  
      if(sat_math){
        if(sat_mathText){
          if(sat_mathText.length > 1){ 
            i = 1 
          }
          else{ i = 0 }
          hilo = sat_mathText[i].split(' ')[0].split('-');
          res.math_low = parseInt(hilo[0]);
          res.math_high = parseInt(hilo[1]);
        }
      }
      
      if(sat_ebrw){
        if(sat_ebrwText){
          if(sat_ebrwText.length > 1){ 
            i = 1 
          }
          else{ i = 0 }
          hilo = sat_ebrwText[i].split(' ')[0].split('-');
          res.ebrw_low = parseInt(hilo[0]);
          res.ebrw_high = parseInt(hilo[1]);
        }
      }
  
      var avgGPA = await document.querySelector("#profile-admission > div:nth-child(4) > div > dl:nth-child(5) > dd:nth-child(2)");
      if(!avgGPA){
        avgGPA = await document.querySelector("#profile-overview > div:nth-child(4) > div > dl:nth-child(4) > dd:nth-child(2)");
        isMirror = 0
      }
      if(avgGPA){
        res.avgGPA = parseFloat(avgGPA.innerText.replace(/\D^./g,''));
      }
  
      if(isMirror === 1){
        var majors = []; 
        majors = await document.querySelector("#profile-academics > div:nth-child(2) > div > div")
        
        if(majors){
          majors = majors.innerText.split('\n')
          var i;
          for(i = 0; i < majors.length; i++){
            majors[i] = majors[i].replace(', Other', '').replace(', General', '').split(/,|\//g)[0]
            if(majors[i].includes('Architectural Engineering Technology/Technician')){
              majors[i] = majors[i].substring(0,'Architectural Engineering'.length)
            }
            if(majors[i].includes('Business Administration and Management')){
              majors[i] = 'Business Administration'
            }
            if(majors[i].includes('Construction Engineering Technology')){
              majors[i] = 'Construction Engineering'
            }
          }
          res.majors = majors
        }
      }
      
      return res
    });
    if(config.collegedatasite.includes("https://www.collegedata.com/college/") && data){
      url = url + "/?tab=profile-academics-tab"
      await page.goto(url,{
        waitLoad: true,
        waitNetworkIdle: true
      });

      let majorData = await page.evaluate(async () => {
        var majors = document.querySelector("#profile-academics > div:nth-child(2) > div > div > div:nth-child(1) > ul");
        if(majors){
          majors = majors.innerText.split('\n')
          var i;
          for(i = 0; i < majors.length; i++){
            majors[i] = majors[i].replace(', Other', '').replace(', General', '').split(/,|\//g)[0]
            if(majors[i].includes('Architectural Engineering Technology/Technician')){
              majors[i] = majors[i].substring(0,'Architectural Engineering'.length)
            }
            if(majors[i].includes('Business Administration and Management')){
              majors[i] = 'Business Administration'
            }
            if(majors[i].includes('Construction Engineering Technology')){
              majors[i] = 'Construction Engineering'
            }
          }
          return majors
        }
        return null
      });

      if(majorData){
        data.majors = majorData
      }
    }
    if(data){
      data.name = currentCollege
      dataArray.push(data)
    }
  }

  await browser.close(); //comment this back in when fully working or your resources will be drained
  return dataArray;
}

function printData(data) {
  console.log(data)
}

exports.scrape = scrape;

// scrape().then(printData)

/*
  loop within scrape that reads all the colleges in colleges.txt, and searches for each one 
*/
