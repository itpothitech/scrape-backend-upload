const mongoose = require("mongoose");

const instaScrape = require("../../scrape-instagram/lib/instance");
const tiktokScrape = require("../../scrape-tiktok/lib/instance");
const UserProfile = require("../model/user-profiles");

const MAX_COUNT = 12;

let vending = (options) => {
  return vending.create(options);
};

vending.create = async (options) => {
  //Get list of user profiles based on platform from database
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

  console.log(
    "Going to fetch users for [",
    options.type,
    "] records from database."
  );

  let profiles;
  try {
    profiles = await UserProfile.find({ platform: options.type });
    console.log("profiles =>", profiles);
  } catch (error) {
    mongoose.disconnect();
    console.log(error);
  }
  // close DB connection
  mongoose.disconnect();

  // let userProfile = ["natgeo", "pubity", "eloisefouladgar"];
  let userProfile = [];
  profiles.forEach((element) => {
    userProfile.push(element.user_name);
  });

  let outArray = [];
  if (options.type == "tiktok") {
    for (const userId of userProfile) {
      const inputs = {
        id: userId,
        scrapeType: "user",
        number: MAX_COUNT,
        cli: options.cli,
      };
      let out = await tiktokScrape(inputs).getPosts();
      outArray.push(out);
    }
    return outArray;
  } else if (options.type == "instagram") {
    for (const userId of userProfile) {
      const inputs = {
        id: userId,
        scrapeType: "user",
        number: MAX_COUNT,
        cli: options.cli,
      };
      let out = await instaScrape(inputs).getPosts();
      outArray.push(out);
    }
    return outArray;
  } else {
    return {
      status: "FAILED",
      message: "Unsupported platform",
    };
  }
};

module.exports = vending;
