const InstaTouch = require("instatouch");
const mongoose = require("mongoose");

const InstaProfile = require("../model/insta-profile");

const TIMEOUT = 50;

class ScrapeInsta {
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
          "***** Instagram scraping - user:[" +
            this._id +
            "] ***** [" +
            currentDate +
            "]"
        );
        const userData = await InstaTouch.getUserMeta(this._id, {
          count: this._count,
          timeout: TIMEOUT,
          session: "sessionid=31834034497%3AXlPlMzyBav5659%3A5",
        });
        console.log(userData);
        const collectorArray =
          userData.graphql.user.edge_owner_to_timeline_media.edges;
        const numOfRecords = collectorArray.length;
        console.log("Going to save [", numOfRecords, "] records in DB.");
        if (numOfRecords == 0) {
          return resolve({
            id: this._id,
            platform: "instagram",
            scrapeDate: scrapeDate,
            status: "FAILED",
            message: "Couldn not scrape any posts for user [" + this._id + "]",
          });
        }

        if (userData) {
          //Extract required data
          const latestPostsCollector = [];
          const postsArray =
            userData.graphql.user.edge_owner_to_timeline_media.edges;
          postsArray.forEach((element) => {
            const eachPost = {
              // _id: element.node.id,
              post_id: element.node.id,
              post_type: element.node.__typename,
              post_display_image: element.node.display_url,
              post_owner_id: element.node.owner.id,
              post_owner_name: element.node.owner.username,
              post_create_time: element.node.taken_at_timestamp,
              post_is_video: element.node.is_video,
              post_comments_count: element.node.edge_media_to_comment.count,
              post_like_count: element.node.edge_liked_by.count,
              post_video_view_count: element.node.video_view_count,
            };
            // console.log("each element =>" , eachPost)
            latestPostsCollector.push(eachPost);
          });
          // console.log("latestPostsCollector ==>", latestPostsCollector.length);

          const profileArray = [];
          const profile = {
            scrape_date: scrapeDate,
            user_id: userData.graphql.user.id,
            user_name: userData.graphql.user.username,
            full_name: userData.graphql.user.full_name,
            biography: userData.graphql.user.biography,
            profile_photo: userData.graphql.user.profile_pic_url_hd,
            is_verified: userData.graphql.user.is_verified,
            followers_count: userData.graphql.user.edge_followed_by.count,
            following_count: userData.graphql.user.edge_follow.count,
            total_posts_count:
              userData.graphql.user.edge_owner_to_timeline_media.count,
          };
          profileArray.push({ profile, latest_posts: latestPostsCollector });
          // console.log("profileArray ======>", profileArray);

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

          // Save profile data in DB
          try {
            await InstaProfile.collection.insertMany(profileArray, {
              ordered: false,
            });
          } catch (error) {
            console.log(error);
          }

          // close DB connection
          mongoose.disconnect();
        } // End of IF condition

        currentDate = new Date();
        const timeTaken = currentDate.getTime() - start;
        console.log(
          "InstaScrape=ID:[" + this._id + "]=perf-time:[" + timeTaken + "]"
        );
        return resolve({
          id: this._id,
          platform: "instagram",
          scrapeDate: scrapeDate,
          status: "SUCCESS",
          recordsEntered: this._count,
          postsScraped: numOfRecords,
          timeTaken: timeTaken,
        });
      } catch (error) {
        mongoose.disconnect();
        console.log(error);
        return reject({
          id: this._id,
          platform: "instagram",
          scrapeDate: scrapeDate,
          status: "FAILED",
          message: "Scrape API error for user [" + this._id + "]",
        });
      }
    });
  }
}

module.exports = ScrapeInsta;
