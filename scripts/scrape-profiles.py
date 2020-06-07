#! python3
from jproperties import Properties 
from Naked.toolshed.shell import execute_js, muterun_js


configs = Properties()

with open('scrape.properties', 'rb') as config_file:
    configs.load(config_file)

DAILY_RUN_COUNT = configs.get("DAILY_RUN_COUNT").data

# TikTok config
SCRAPE_TIKTOK = configs.get("SCRAPE_TIKTOK").data
TIKTOK_SCRAPER = configs.get("TIKTOK_SCRAPER").data 
TIKTOK_SCRAPER_ARGS = TIKTOK_SCRAPER + " scrape tiktok -c " + DAILY_RUN_COUNT

#Instagram config
SCRAPE_INSTA = configs.get("SCRAPE_INSTA").data
INSTA_SCRAPER = configs.get("INSTA_SCRAPER").data 
INSTA_SCRAPER_ARGS = INSTA_SCRAPER + " scrape instagram -c " + DAILY_RUN_COUNT

print ("SCRAPE_TIKTOK =>" + SCRAPE_TIKTOK)
print ("TIKTOK_SCRAPER =>" + TIKTOK_SCRAPER)
print ("TIKTOK_SCRAPER_ARGS =>" + TIKTOK_SCRAPER_ARGS)

print ("SCRAPE_INSTA =>" + SCRAPE_INSTA)
print ("INSTA_SCRAPER =>" + INSTA_SCRAPER)
print ("INSTA_SCRAPER_ARGS =>" + INSTA_SCRAPER_ARGS)

if (SCRAPE_TIKTOK):
    tiktok_res = muterun_js(TIKTOK_SCRAPER_ARGS)

if tiktok_res.exitcode == 0:
  print(tiktok_res.stdout)
else:
  sys.stderr.write(tiktok_res.stderr)


if (SCRAPE_INSTA):
    insta_res = muterun_js(INSTA_SCRAPER_ARGS)
    
if insta_res.exitcode == 0:
  print(insta_res.stdout)
else:
  sys.stderr.write(insta_res.stderr)
