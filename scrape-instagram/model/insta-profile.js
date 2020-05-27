const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const instaProfileSchema = new Schema({
  _id: {
    type: "String",
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
});

module.exports = mongoose.model("InstaProfile", instaProfileSchema);
