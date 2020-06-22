const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userScrapeStatus = new Schema({
  id: {
    type: "String",
  },
  platform: {
    type: "string",
  },
  scrapeDate: {
    type: "String",
  },
  status: {
    type: "String",
  },
  recordsEntered: {
    type: "Number",
  },
  postsScraped: {
    type: "Number",
  },
  timeTaken: {
    type: "Number",
  },
});

module.exports = mongoose.model("ScrapeStatus", userScrapeStatus);
