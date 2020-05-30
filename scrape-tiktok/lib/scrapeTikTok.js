const TikTokScraper = require("tiktok-scraper");
const mongoose = require("mongoose");

const TiktokPost = require("../models/tiktok-post");
const TiktokProfile = require("../models/tiktok-profile");

const PROXIES = [
  "80.187.140.26:8080",
  "190.111.231.8:8080",
  "49.0.82.190:8080",
];
const TIMEOUT = 50;

class ScrapeTikTok {
  constructor({ id, scrapeType, number, cli }) {
    this._id = id;
    this._type = scrapeType;
    this._count = number;
    this._cli = cli;
  }

  getPosts() {
    return new Promise(async (resolve, reject) => {
      try {
        let currentDate = new Date();
        const start = currentDate.getTime();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const date = currentDate.getDate();
        const scrapeDate = year + "-" + month + "-" + date;

        console.log("***** Insta scraping ***** [" + currentDate + "]");

        const posts = await TikTokScraper.user(this._id, {
          number: this._count,
          timeout: TIMEOUT,
        });
        // console.log(posts);
        const collectorArray = posts.collector;
        const numOfRecords = collectorArray.length;
        console.log("Going to save [", numOfRecords, "] records in DB.");
        if (numOfRecords == 0) {
          return reject({
            status: "FAILED",
            message: "Couldn not scrape any posts for user [" + this._id + "]",
          });
        }

        // const newBulkArray = [];
        // collectorArray.forEach((element) => {
        //   newBulkArray.push({ _id: element.id, element });
        // });
        // console.log("newBulkArray =>", newBulkArray);

        if (collectorArray) {
          let profile;
          const latestPostsCollector = [];
          collectorArray.forEach((element) => {
            profile = {
              scrape_date: scrapeDate,
              user_id: element.authorMeta.id,
              user_name: element.authorMeta.name,
              full_name: element.authorMeta.nickName,
              biography: element.authorMeta.signature,
              profile_photo: element.authorMeta.avatar,
              is_verified: element.authorMeta.verified,
              followers_count: element.authorMeta.fans,
              following_count: element.authorMeta.following,
              total_posts_count: element.authorMeta.video,
            };

            const eachPost = {
              post_id: element.id,
              post_link: element.webVideoUrl,
              post_owner_id: element.authorMeta.id,
              post_owner_name: element.authorMeta.name,
              post_create_time: element.createTime,
              post_comments_count: element.commentCount,
              post_like_count: element.diggCount,
              post_video_view_count: element.playCount,
            };
            latestPostsCollector.push(eachPost);
          });

          const profileArray = [];
          profileArray.push({ profile, latest_posts: latestPostsCollector });
          console.log("profileArray =>", profileArray);

          //Connect DB
          await mongoose
            .connect(
              // `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-free-2u1w7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
              `mongodb+srv://scraper:eGRsfe2ZFZnZapuo@cluster-free-2u1w7.mongodb.net/dev_local?retryWrites=true&w=majority`,
              { useNewUrlParser: true, useUnifiedTopology: true }
            )
            .catch((error) => {
              handleError(error);
              console.log(error);
            });

          //Save profile details in DB
          try {
            await TiktokProfile.collection.insertMany(profileArray);
          } catch (error) {
            // console.log(error);
          }
        } //end of if

        // const profile = await TikTokScraper.getUserProfileInfo(this._id);
        // const profileArray = [];
        // profileArray.push({
        //   scrape_date: scrapeDate,
        //   profile,
        //   latest_posts: collectorArray,
        // });

        // Save post details in DB
        // const createdTiktokPost = new TiktokPost();
        // try {
        //   await createdTiktokPost.collection.insertMany(newBulkArray, {
        //     ordered: false,
        //   });
        // } catch (err) {
        //   // console.log(err);
        // }
        currentDate = new Date();
        const timeTaken = currentDate.getTime() - start;
        console.log(
          "InstaScrape=ID:[" + this._id + "]=perf-time:[" + timeTaken + "]"
        );
        mongoose.disconnect();
        //Send response
        return resolve({
          id: this._id,
          recordsEntered: this._count,
          recrdsScraped: numOfRecords,
        });
      } catch (error) {
        mongoose.disconnect();
        return reject(error);
      }
    });
  }
}

module.exports = ScrapeTikTok;
