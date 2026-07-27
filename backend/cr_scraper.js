let puppeteer = require('puppeteer');
let fs = require('fs');
let path = require('path');

// Resolved against this file, not the process working directory.
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const colleges = fs.readFileSync(path.join(__dirname, 'colleges.txt'), 'utf8')

async function scrape(){
  const browser = await puppeteer.launch({headless: true}); //debugging purposes - shouldn't be false in practice
  // Ensures the browser is closed even when the page fails to load.
  try {
    return await scrapeRankings(browser);
  } finally {
    await browser.close();
  }
}

async function scrapeRankings(browser){
  const page = await browser.newPage();
  const url = config.collegeranksite;

  await page.goto(url,{
    waitLoad: true,
    waitNetworkIdle: true
  });

  let data = await page.evaluate(async () => {
    var row = await document.querySelectorAll('[role=row]');
    let result = [];
    
    for(let i=1; i<row.length;i++){
      let rowObj = {}
      var strRow = row[i].innerText.split(/[\n\t]/)
      rowObj.rank = parseInt(strRow[0].replace(/\D/g,''));
      
      let collegeName = strRow[1]

      rowObj.name = collegeName
      rowObj.location = strRow[2]
      result.push(rowObj)
    }
    
    return result
  });
  let resData = []
  let collegeArray = colleges.replace(/\r/g,'').split('\n')
  data.forEach(function(element){
    if(collegeArray.includes(element.name)){
      resData.push(element)
    }
  })
  return resData;
}

// debugging purposes
// function printData(data) {
//   console.log(data)
// }

exports.scrape = scrape;
// scrape().then(printData)
