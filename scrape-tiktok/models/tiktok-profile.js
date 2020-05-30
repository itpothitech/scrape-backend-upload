const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tiktokProfileSchema = new Schema({
  scrape_date: {
    type: "Date",
  },
  secUid: {
    type: "String",
  },
  userId: {
    type: "String",
  },
  isSecret: {
    type: "Boolean",
  },
  uniqueId: {
    type: "String",
  },
  nickName: {
    type: "String",
  },
  signature: {
    type: "String",
  },
  covers: {
    type: ["String"],
  },
  coversMedium: {
    type: ["String"],
  },
  following: {
    type: "Number",
  },
  fans: {
    type: "Number",
  },
  heart: {
    type: "Number",
  },
  video: {
    type: "Number",
  },
  verified: {
    type: "Boolean",
  },
  digg: {
    type: "Number",
  },
  ftc: {
    type: "Boolean",
  },
  relation: {
    type: "Number",
  },
  openFavorite: {
    type: "Boolean",
  },
  latest_posts: {
    type: ["Mixed"],
  },
});

module.exports = mongoose.model("TiktokProfile", tiktokProfileSchema);
