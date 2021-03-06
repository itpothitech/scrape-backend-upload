const mongoose = require("mongoose");

const instaScrape = require("../../scrape-instagram/lib/instance");
const tiktokScrape = require("../../scrape-tiktok/lib/instance");
const UserProfile = require("../model/user-profiles");
const ScrapeStatus = require("../model/scrape-status");

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
  } catch (error) {
    console.log(error);
  }

  mongoose.disconnect();

  if (profiles.length == 0) {
    return {
      status: "FAILED",
      message:
        "Couldnt fetch any user profile records for patform [" +
        options.type +
        "]",
    };
  }

  let userProfile = [];
  profiles.forEach((element) => {
    userProfile.push(element.user_name);
  });

  // Index range is passed from upstream application that will calculate number of user profiles exist in the database
  // and calculate. It is required to call the scraper from multiple thread.
  let indexedUserProfile = userProfile.slice(options.start, options.end);
  console.log("indexedUserProfile =>", indexedUserProfile.length);

  let outArray = [];
  if (options.type == "tiktok") {
    for (const userId of indexedUserProfile) {
      const inputs = {
        id: userId,
        scrapeType: "user",
        number: MAX_COUNT,
        cli: options.cli,
      };
      try {
        let out = await tiktokScrape(inputs).getPosts();
        outArray.push(out);
      } catch (error) {
        outArray.push(error);
      }
    }
  } else if (options.type == "instagram") {
    for (const userId of indexedUserProfile) {
      const inputs = {
        id: userId,
        scrapeType: "user",
        number: MAX_COUNT,
        cli: options.cli,
      };
      try {
        let out = await instaScrape(inputs).getPosts();
        outArray.push(out);
      } catch (error) {
        outArray.push(error);
      }
    }
  } else {
    mongoose.disconnect();
    return {
      status: "FAILED",
      message: "Unsupported platform",
    };
  }

  if (outArray.length > 0) {
    // Save the status in DB
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

    try {
      await ScrapeStatus.collection.insertMany(outArray, {
        ordered: false,
      });
    } catch (error) {
      console.log(error);
    }

    // close DB connection
    mongoose.disconnect();
    return outArray;
  }
};

module.exports = vending;
