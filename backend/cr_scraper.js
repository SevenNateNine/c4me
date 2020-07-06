let puppeteer = require('puppeteer');
let fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const colleges = fs.readFileSync('colleges.txt', 'utf8')

async function scrape(){
  const browser = await puppeteer.launch({headless: true}); //debugging purposes - shouldn't be false in practice
  const page = await browser.newPage();
  url = config.collegeranksite;

  await page.goto(url,{
    waitLoad: true,
    waitNetworkIdle: true
  });

  let data = await page.evaluate(async () => {
    var row = await document.querySelectorAll('[role=row]');
    let result = [];
    
    for(i=1; i<row.length;i++){ 
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
  await browser.close(); //comment this back in when fully working or your resources will be drained
  
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
