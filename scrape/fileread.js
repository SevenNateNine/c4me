const fs = require('fs');
const puppeteer=require('puppeteer');


async function scrape(keyword){
  const browser = await puppeteer.launch({headless: false}); //debugging purposes - shouldn't be false in practice
  const page = await browser.newPage();
  url="https://www.collegedata.com/en/explore-colleges/college-search/SearchByPreference/?SearchByPreference.CollegeName="+
  keyword+ "&SearchByPreference.SearchType=ByName";

  await page.goto(url,{
    waitLoad: true,
    waitNetworkIdle: true
  });

  let data = await page.evaluate(async () => {
      var elements = await document.querySelectorAll('td');

      /*Elements is an array of all the elements in a td.
      To prove I have access to it, the for loop modifies the DOM
      to double their inner Text and change the color red.
      The point of doing this is to prove the array works properly.
      I am entirely unsure of how to store relevant data in an async safe manner.
      This is the problem I'm having. if you take the inner text of certain <td>s,
      they will contain relevant data. Some will be irrelevant ofc, but we can hardcode their index numbers once discovering them.
      I tried finding them with console.log, but I can't because it's not async safe. That was a 7 hour long lesson.
      Text is accessible in elements[x].innerText
      */
      let r = [];
      for(x=0;x<elements.length;x++) {
          r.push(elements[x].innerText);
          elements[x].style.backgroundColor="red";
      }
      return r;
  });
  await browser.close(); //comment this back in when fully working or your resources will be drained
  return data;
}


function printData(data) {
  console.log(data);
}

/*
*Wrap - Wraps Scrape method. Opens colleges.txt line by line, replaces spaces with a - for
*use in URL. Then calls scrape to launch a headless chromium browser and pull from that.
*/
async function wrap(){
    fs.readFile('colleges.txt', 'utf-8', (err, data) => { 
        if (err) throw err; 
            const lines = data.split(/\r\n|\n/);
            lines.forEach((line) => {
              line=line.replace(/ /g,"-");
              /*Puppeteer code goes here, passing in line as keyword parameter. IDK if this works as intended.
              *It blew up my computer last time I did something similar
              await scrape(line);
              */
            }); 
        }) 
  }

scrape("Stony Brook University").then(printData); //this is the only query ran when testing with fileread.js
