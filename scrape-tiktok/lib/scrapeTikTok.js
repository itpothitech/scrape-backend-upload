const TikTokScraper = require("tiktok-scraper");
const mongoose = require("mongoose");

const TiktokProfile = require("../model/tiktok-profile");

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
      let currentDate = new Date();
      const start = currentDate.getTime();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const date = currentDate.getDate();
      // const scrapeDate = year + "-" + month + "-" + date;
      const scrapeDate = currentDate.getTime();

      try {
        console.log(
          "***** TikTok scraping - user:[" +
            this._id +
            "] ***** [" +
            currentDate +
            "]"
        );
        const posts = await TikTokScraper.user(this._id, {
          number: this._count,
          timeout: TIMEOUT,
        });
        // console.log(posts);

        const userMeta  = await TikTokScraper.getUserProfileInfo(this._id, {
          number: this._count,
          timeout: TIMEOUT,
        });
        // console.log("User meta data ==>", userMeta)

        const collectorArray = posts.collector;
        const numOfRecords = collectorArray.length;
        console.log("Going to save [", numOfRecords, "] records in DB.");
        if (numOfRecords == 0) {
          return resolve({
            id: this._id,
            platform: "tiktok",
            scrapeDate: scrapeDate,
            status: "FAILED",
            message: "Couldn not scrape any posts for user [" + this._id + "]",
          });
        }

        if (collectorArray) {
          let profile;
          const latestPostsCollector = [];
          let profile_pic = ""
          collectorArray.forEach((element) => {
            // console.log("Author metadata ==>", element)
            // profile = {
            //   scrape_date: scrapeDate,
            //   user_id: element.authorMeta.id,
            //   user_name: element.authorMeta.name,
            //   full_name: element.authorMeta.nickName,
            //   biography: element.authorMeta.signature,
            //   profile_photo: element.authorMeta.avatar,
            //   is_verified: element.authorMeta.verified,
            //   followers_count: element.authorMeta.fans,
            //   following_count: element.authorMeta.following,
            //   total_posts_count: element.authorMeta.video,
            // };

            profile_pic = element.authorMeta.avatar
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

          //Take user profile details from API: getUserProfileInfo
          if (profile_pic == "") {
            profile_pic = userMeta.covers[0]
          }
          profile = {
            scrape_date: scrapeDate,
            user_id: userMeta.userId,
            user_name: userMeta.uniqueId,
            full_name: userMeta.nickName,
            biography: userMeta.signature,
            profile_photo: profile_pic,
            is_verified: userMeta.verified,
            followers_count: userMeta.fans,
            following_count: userMeta.following,
            total_posts_count: userMeta.video,
          };
          const profileArray = [];
          profileArray.push({ profile, latest_posts: latestPostsCollector });
          // console.log("profileArray =>", profileArray);

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
          // close DB connection
          mongoose.disconnect();
        } //end of if

        currentDate = new Date();
        const timeTaken = currentDate.getTime() - start;
        console.log(
          "TikTokScrape=ID:[" + this._id + "]=perf-time:[" + timeTaken + "]"
        );
        mongoose.disconnect();
        //Send response
        return resolve({
          id: this._id,
          platform: "tiktok",
          scrapeDate: scrapeDate,
          status: "SUCCESS",
          recordsEntered: this._count,
          recrdsScraped: numOfRecords,
          timeTaken: timeTaken,
        });
      } catch (error) {
        console.log(error);
        mongoose.disconnect();
        return reject({
          id: this._id,
          platform: "tiktok",
          scrapeDate: scrapeDate,
          status: "FAILED",
          message: "Scrape API error for user [" + this._id + "]",
        });
      }
    });
  }
}

module.exports = ScrapeTikTok;
