const puppeteer=require('puppeteer');

async function scrape(keyword){
  const browser = await puppeteer.launch({headless: true}); //debugging purposes - shouldn't be false in practice
  const page = await browser.newPage();
  url="http://allv22.all.cs.stonybrook.edu/~stoller/cse416/niche/"+keyword+"/academics/";

  await page.goto(url,{
    waitLoad: true,
    waitNetworkIdle: true
  });

  let data = await page.evaluate(async () => {
      var title = await document.querySelectorAll('.postcard__title'); // test scores and ap enrollment
      var testElements = await document.querySelectorAll('.scalar');
      var apElements = await document.querySelectorAll('.scalar--three');
      var location = await document.querySelectorAll('.postcard__attr'); // location
      var majorCollegeElements = await document.querySelectorAll('.popular-entity__name');  // popular majors and colleges

      let r = {};
      /* name of school */
      for(i=0; i<title.length; i++) {
        var titleArray = title[i].innerText.split(/\n/)
        r.name = titleArray[0];
      }

      /* majors & colleges */
      let majors = [];
      let colleges = [];
      for(i=0; i<majorCollegeElements.length; i++) {
          if(i < 10){
            colleges.push(majorCollegeElements[i].innerText)
          }
          else{
            majors.push(majorCollegeElements[i].innerText)
          }
      }
      if(majors.length > 0){ 
        r.majors = majors
      }
      if(colleges.length > 0){
        r.colleges = colleges
      }

      /* location - state*/
      for(i=0; i<location.length; i++) {
        if(i == 3){
          var locArray = location[i].innerText.split(/,/)
          r.city = locArray[0].trim()
          r.state = locArray[1].trim()
        }
      }

      /* ap */
      for(i=0; i<apElements.length; i++) {
        var current = apElements[i].innerText
        if(current.includes("AP Enrollment")){
          var score = current.split("\n")[2].replace('%','')
          if(score === "—" ){ score = null}
          r.ap_enroll = score
        }
      }

      /* test scores */
      for(i=0; i<testElements.length; i++) {
        var current = testElements[i].innerText
        if(current.includes("Average SAT")){
          var score = current.split("\n")[2]
          if(score === "—" ){ score = null}
          r.sat_score = score
        }
        if(current.includes("Average ACT")){
          var score = current.split("\n")[2]
          if(score === "—"){score = null}
          r.act_score = score
        }
      }
      return r;
  });
  await browser.close(); //comment this back in when fully working or your resources will be drained
  return data;
}

function printData(data) {
  for(i = 0; i < data.length; i++){
      console.log(data[i])
  }
}

exports.scrape = scrape;

// scrape('arcadia-high-school-arcadia-oh').then(printData)
