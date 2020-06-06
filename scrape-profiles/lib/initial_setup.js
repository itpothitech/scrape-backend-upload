const mongoose = require("mongoose");

const UserProfile = require("../model/user-profiles");
const InstaProfile = require("../../scrape-instagram/model/insta-profile");
const TiktokProfile = require("../../scrape-tiktok/model/tiktok-profile");

let vending = (options) => {
  return vending.setup(options);
};

vending.setup = async () => {
  //Create index for user profile
  await mongoose
    .connect(
      // `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster-free-2u1w7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
      `mongodb+srv://scraper:eGRsfe2ZFZnZapuo@cluster-free-2u1w7.mongodb.net/dev_local?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .catch((error) => {
      handleError(error);
      console.log(error);
    });

  console.log("Going to perform intial database setup.");
  console.log("Creating index for user profile");
  try {
    UserProfile.collection.createIndex(
      { user_name: 1, platform: 1 },
      { unique: true }
    );
  } catch (error) {
    mongoose.disconnect();
    console.log(error);
  }

  // close DB connection
  //   mongoose.disconnect();
  return {
    status: "SUCCESS",
    message: "Successfully performed database setup",
  };
};

module.exports = vending;
