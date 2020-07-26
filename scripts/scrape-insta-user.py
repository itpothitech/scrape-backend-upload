#! python3

from pymongo import MongoClient
from igramscraper.instagram import Instagram
from jproperties import Properties
import datetime as Date
import time
import sys, os
import json
import random

instagram = Instagram()
home_dir = os.environ["HOME"]
script_home = home_dir+"/scrape-backend-upload"
config = script_home+"/scrape.properties"
errorStr = "Account with given username does not exist"

def instaAccountLogin():
  instagram.with_credentials(INSTA_USER1, INSTA_PAS1)
  instagram.login()

# Fetch record from DB
def fetchRecordsFromDB(DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME):
  client = MongoClient("mongodb+srv://"+DB_USER+":"+DB_PASSWORD+"@"+DB_SERVER+"/"+DB_NAME+"?retryWrites=true&w=majority")
  clientDB = client[DB_NAME]
  userCol = clientDB["userprofiles"]
  instaCol = clientDB["instaprofiles"]
  statusCol = clientDB["scrapestatuses"]

  userCountInstagram = userCol.count_documents({"platform":"instagram"})
  userProfilesInstagram = userCol.find({"platform":"instagram"})
  print("userCountInstagram ==>", userCountInstagram)

  #Scrape insta user
  tmpLongDelayCnt = 1
  for instaUser in userProfilesInstagram:
    instaUser = instaUser["user_name"]
    
    #Scrape user profile
    (instaRecord, statusRecord) = scrapeInsta(instaUser)

    #save the document in DB on success
    try:
      if (errorStr != instaRecord):
        instaCol.insert_one(instaRecord)
        statusCol.insert_one(statusRecord)
      else:
        statusCol.insert_one(statusRecord)
    except:
      print("failed to store in DB")

    # Short sleep between each scrape
    shortDelay = random.randint(int(INSTA_SCRAPE_SHORT_DELAY), int(INSTA_SCRAPE_SHORT_DELAY) + 30)
    time.sleep(shortDelay)

    if (tmpLongDelayCnt == INSTA_SCRAPE_LONG_DELAY_CONT):
      time.sleep(int(INSTA_SCRAPE_LONG_DELAY))
    else:
      tmpLongDelayCnt = tmpLongDelayCnt + 1
    
  client.close()


def scrapeInsta(userName):
  #Local variables
  dataDict = {}
  profileDict = {}
  latestPostDict = {}
  latestPostList = []
  statusDict = {}

  start = int(Date.datetime.now().timestamp())
  #Login to insta account
  instaAccountLogin()
  print("Going to scrape user =>", userName)
  try:
    account = instagram.get_account(userName)
  except:
    statusDict = {
      "id": userName,
      "platform": "instagram",
      "scrapeDate": start,
      "status": "FAILED",
      "message": errorStr
    }
    return (errorStr, statusDict)

  timeStamp = int(Date.datetime.now().timestamp())
  userId = account.identifier
  outputFile = script_home+"/"+INSTA_INPUT_DIR+"/"+str(userId)+"."+str(timeStamp)+".json"

  #Form the dict strings
  #Profile dict
  profileDict = { 
    "scrape_date" : timeStamp,
    "user_id" : str(userId),
    "user_name" : account.username,
    "full_name" : account.full_name,
    "biography" : account.biography,
    "profile_photo" : account.get_profile_picture_url(),
    "is_verified" : account.is_verified,
    "followers_count" : account.followed_by_count,
    "following_count" : account.follows_count,
    "total_posts_count" : account.media_count
  }

  medias = instagram.get_medias(userName, int(INSTA_MAX_POST))
  numOfPosts = len(medias)
  for media in medias:
    postIsVideo = True
    postVideoCnt = 1
    if ("image" == media.type):
      postIsVideo = False
      postVideoCnt = 0
    else:
      postIsVideo = False
      postVideoCnt = 0
    
    # print(media)
    latestPostDict = {
      "post_id" : str(media.identifier),
      "post_type" : media.type,
      "post_display_image" : media.image_high_resolution_url,
      "post_owner_id" : str(userId),
      "post_owner_name" : account.username,
      "post_create_time" : media.created_time ,
      "post_is_video" : postIsVideo,
      "post_comments_count" : media.comments_count,
      "post_like_count" : media.likes_count ,
      "post_video_view_count" : postVideoCnt
    }
    latestPostList.append(latestPostDict)
  
  #construct data dict
  dataDict = {
    "profile" : profileDict,
    "latest_posts" : latestPostList
  }

  #Create status messages
  timeTaken = timeStamp - start
  statusDict = {
    "id": userName,
    "platform": "instagram",
    "scrapeDate": timeStamp,
    "status": "SUCCESS",
    "recordsEntered": int(INSTA_MAX_POST),
    "postsScraped": numOfPosts,
    "timeTaken": timeTaken,
  }

  jsonOut = json.dumps(dataDict)
  with open(outputFile, 'w') as outFile:
    outFile.write(jsonOut)
  return (dataDict, statusDict)



########## MAIN METHOD ##########
if __name__ == "__main__":

  # Get properties
  configs = Properties()
  with open(config, 'rb') as config_file:
      configs.load(config_file)

  # DB Configs
  DB_SERVER = configs.get("DB_SERVER").data
  DB_USER = configs.get("DB_USER").data
  DB_NAME = configs.get("DB_NAME").data
  DB_PASSWORD = configs.get("DB_PASSWORD").data

  INSTA_SCRAPE_SHORT_DELAY = configs.get("INSTA_SCRAPE_SHORT_DELAY").data
  INSTA_SCRAPE_LONG_DELAY = configs.get("INSTA_SCRAPE_LONG_DELAY").data
  INSTA_SCRAPE_LONG_DELAY_CONT = configs.get("INSTA_SCRAPE_LONG_DELAY_CONT").data
  INSTA_MAX_POST = configs.get("INSTA_MAX_POST").data
  INSTA_INPUT_DIR = configs.get("INSTA_INPUT_DIR").data
  INSTA_USER1 = configs.get("INSTA_USER1").data
  INSTA_PAS1 = configs.get("INSTA_PAS1").data

  #Get the count from DB and starting scraping user profiles
  fetchRecordsFromDB(DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME)
