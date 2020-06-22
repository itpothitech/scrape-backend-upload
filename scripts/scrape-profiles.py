#! python3
from jproperties import Properties 
from Naked.toolshed.shell import execute_js, muterun_js
import datetime as Date
import concurrent.futures
import sys

from pymongo import MongoClient

def fetchRecordsFromDB(DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME):
  client = MongoClient("mongodb+srv://"+DB_USER+":"+DB_PASSWORD+"@"+DB_SERVER+"/"+DB_NAME+"?retryWrites=true&w=majority")
  clientDB = client[DB_NAME]
  userCol = clientDB["userprofiles"]

  userCountTikTok = userCol.count_documents({"platform":"tiktok"})
  userCountInstagram = userCol.count_documents({"platform":"instagram"})
  return (userCountTikTok, userCountInstagram)

def execute_scrape(argString):
  print(argString)
  res = muterun_js(argString)
    
  if res.exitcode == 0:
    print(res.stdout)
  else:
    print(res.stderr)



########## MAIN METHOD ##########
if __name__ == "__main__":

  # Get properties
  configs = Properties()
  with open('scrape.properties', 'rb') as config_file:
      configs.load(config_file)

  PROFILES_PER_THREAD = int(configs.get("PROFILES_PER_THREAD").data)
  SCRAPE_TIKTOK = configs.get("SCRAPE_TIKTOK").data
  SCRAPE_INSTA = configs.get("SCRAPE_INSTA").data
  SCRAPER = configs.get("SCRAPER").data
  # DB Configs 
  DB_SERVER = configs.get("DB_SERVER").data
  DB_USER = configs.get("DB_USER").data
  DB_NAME = configs.get("DB_NAME").data
  DB_PASSWORD = configs.get("DB_PASSWORD").data

  #Get the count from DB
  (userCountTikTok, userCountInstagram) = fetchRecordsFromDB(DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME)
  print("userCountTikTok =>", userCountTikTok)
  print("userCountInstagram =>", userCountInstagram)

  if (SCRAPE_TIKTOK):
    print ("[START] TikTok scraping process at [", Date.datetime.now(), "]")
    SCRAPER_ARGS = list()

    if (userCountTikTok <= PROFILES_PER_THREAD):
      start = 0
      end = userCountTikTok
      SCRAPER_ARGS.append(SCRAPER + " scrape tiktok -s " + str(start) + " -e " + str(end))
    else:
      orgCnt = userCountTikTok
      start = 0
      end = PROFILES_PER_THREAD
      SCRAPER_ARGS.append(SCRAPER + " scrape tiktok -s " + str(start) + " -e " + str(end))
      while (orgCnt > PROFILES_PER_THREAD):
        orgCnt = orgCnt - PROFILES_PER_THREAD
        start = start + PROFILES_PER_THREAD
        newStart = start + 1
        if (orgCnt <= PROFILES_PER_THREAD):
          newEnd = userCountTikTok
          SCRAPER_ARGS.append(SCRAPER + " scrape tiktok -s " + str(newStart) + " -e " + str(newEnd))
        else:
          newEnd = start + PROFILES_PER_THREAD
          SCRAPER_ARGS.append(SCRAPER + " scrape tiktok -s " + str(newStart) + " -e " + str(newEnd))

    maxThreads = len(SCRAPER_ARGS)
    print("maxThreads =>", maxThreads)
    # Spawn threads to run scrape
    with concurrent.futures.ThreadPoolExecutor(max_workers=maxThreads) as executor:
        executor.map(execute_scrape, SCRAPER_ARGS)
    print ("[END] TikTok scraping process at [", Date.datetime.now(), "]")
    
  if (SCRAPE_INSTA):
    print ("[START] Instgram scraping process at [", Date.datetime.now(), "]")
    SCRAPER_ARGS = list()
    # userCountInstagram = 651

    if (userCountInstagram <= PROFILES_PER_THREAD):
      start = 0
      end = userCountInstagram
      SCRAPER_ARGS.append(SCRAPER + " scrape instagram -s " + str(start) + " -e " + str(end))
    else:
      orgCnt = userCountInstagram
      start = 0
      end = PROFILES_PER_THREAD
      SCRAPER_ARGS.append(SCRAPER + " scrape instagram -s " + str(start) + " -e " + str(end))
      while (orgCnt > PROFILES_PER_THREAD):
        orgCnt = orgCnt - PROFILES_PER_THREAD
        start = start + PROFILES_PER_THREAD
        newStart = start + 1
        if (orgCnt <= PROFILES_PER_THREAD):
          newEnd = userCountInstagram
          SCRAPER_ARGS.append(SCRAPER + " scrape instagram -s " + str(newStart) + " -e " + str(newEnd))
        else:
          newEnd = start + PROFILES_PER_THREAD
          SCRAPER_ARGS.append(SCRAPER + " scrape instagram -s " + str(newStart) + " -e " + str(newEnd))
      
    maxThreads = len(SCRAPER_ARGS)
    print("maxThreads =>", maxThreads)

    # Spawn threads to run scrape
    with concurrent.futures.ThreadPoolExecutor(max_workers=maxThreads) as executor:
        executor.map(execute_scrape, SCRAPER_ARGS) 
    print ("[END] Instgram scraping process at [", Date.datetime.now(), "]")

  sys.exit(0) 

