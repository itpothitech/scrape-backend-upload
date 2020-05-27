const InstaTouch = require("instatouch");
const mongoose = require("mongoose");

const InstaPost = require("../model/insta-posts");
const InstaProfile = require("../model/insta-profile");

const JSON_LABALES = {
  user_id: "graphql.user.username",
  full_name: "graphql.user.full_name",
  biography: "graphql.user.biography",
  profile_photo: "graphql.user.profile_pic_url_hd",
  is_verified: "graphql.user.is_verified",
  followers_count: "graphql.user.edge_followed_by.count",
  following_count: "graphql.user.edge_follow.count",
  total_posts_count: "graphql.user.edge_owner_to_timeline_media.count",
  posts_list_array: "graphql.user.edge_owner_to_timeline_media.edges",
};

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
      try {
        // const posts = await InstaTouch.user(this._id, {
        //   count: this._count,
        //   timeout: TIMEOUT,
        // });
        // console.log(posts);

        const userData = await InstaTouch.getUserMeta(this._id, {
          count: this._count,
          timeout: TIMEOUT,
        });
        // console.log(userData);
        const collectorArray =
          userData.graphql.user.edge_owner_to_timeline_media.edges;
        const numOfRecords = collectorArray.length;
        console.log("Going to save [", numOfRecords, "] records in DB.");
        if (numOfRecords == 0) {
          return reject({
            status: "FAILED",
            message: "Couldn not scrape any posts for user [" + this._id + "]",
          });
        }

        if (userData) {
          //Extract required data
          const latestPostsView = [];
          const postsArray =
            userData.graphql.user.edge_owner_to_timeline_media.edges;
          postsArray.forEach((element) => {
            const eachPost = {
              _id: element.node.id,
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
            latestPostsView.push(eachPost);
          });
          console.log("latestPostsView ==>", latestPostsView.length);

          const profileArray = [];
          const profile = {
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
          profileArray.push({ _id: profile.id, profile });
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
          // Save post details in DB
          try {
            await InstaPost.collection.insertMany(latestPostsView, {
              ordered: false,
            });
          } catch (err) {
            console.log(err);
          }

          // close DB connection
          mongoose.disconnect();
        } // End of IF condition
        return resolve({
          id: this._id,
          recordsEntered: this._count,
          postsScraped: numOfRecords,
        });
      } catch (error) {
        mongoose.disconnect();
        console.log(error);
        return reject(error);
      }
    });
  }
}

module.exports = ScrapeInsta;
