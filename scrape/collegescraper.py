
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import sys
'''
Important: Install Gecko Driver to Run
https://github.com/mozilla/geckodriver/releases
Notes: Colleges with commas in them (University of California, Berkley or whatever) are saved with . instead of comma for CSV saving.
'''
def main():
f=open('colleges.txt')
collegelist=f.read().splitlines()
f.close()
url="https://www.timeshighereducation.com/rankings/united-states/2020#!/page/0/length/-1/sort_by/rank/sort_order/asc/cols/stats"
options = Options()
options.headless = True
driver = webdriver.Firefox(options=options)
driver.get(url)
soup = BeautifulSoup(driver.page_source, 'html.parser')
names= soup.find_all("a",{"class": "ranking-institution-title"})
#<td class="rank sorting_1 sorting_2>
rankings= soup.find_all("td",{"class": "rank sorting_1 sorting_2"})
x=0
f=open('rankings.csv','w')
csvstr+=("Rank,Name\n")
while(x<len(names)):
    if(names[x].text in collegelist):
        csvstr+=(rankings[x].text + " " +names[x].text)
       #f.write(rankings[x].text + "," +names[x].text.replace(",",".")+"\n")
    x+=1
f.close()
driver.quit()
return csvstr
