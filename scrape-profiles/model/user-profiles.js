const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
  create_date: {
    type: "String",
  },
  modify_date: {
    type: "String",
  },
  platform: {
    type: "String",
  },
  user_name: {
    type: "String",
  },
  tags: {
    type: ["String"],
  },
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
