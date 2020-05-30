const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const instaProfileSchema = new Schema({
  scrape_date: {
    type: "Date",
  },
  user_id: {
    type: "String",
  },
  user_name: {
    type: "String",
  },
  full_name: {
    type: "String",
  },
  biography: {
    type: "String",
  },
  profile_photo: {
    type: "String",
  },
  is_verified: {
    type: "Boolean",
  },
  followers_count: {
    type: "Number",
  },
  following_count: {
    type: "Number",
  },
  total_posts_count: {
    type: "Number",
  },
  latest_posts: {
    type: ["Mixed"],
  },
});

module.exports = mongoose.model("InstaProfile", instaProfileSchema);
