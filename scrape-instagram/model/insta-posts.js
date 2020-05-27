const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const instaSchema = new Schema({
  _id: {
    type: "String",
  },
  post_id: {
    type: "String",
  },
  post_type: {
    type: "String",
  },
  post_display_image: {
    type: "String",
  },
  post_owner_id: {
    type: "String",
  },
  post_owner_name: {
    type: "String",
  },
  post_create_time: {
    type: "String",
  },
  post_is_video: {
    type: "String",
  },
  post_comments_count: {
    type: "String",
  },
  post_like_count: {
    type: "String",
  },
  post_video_view_count: {
    type: "String",
  },
});

module.exports = mongoose.model("InstaPost", instaSchema);
