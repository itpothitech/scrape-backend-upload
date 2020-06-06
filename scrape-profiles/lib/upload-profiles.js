const mongoose = require("mongoose");
const fs = require("fs-js");
const xlsx = require("xlsx");

const UserProfile = require("../model/user-profiles");

let vending = (options) => {
  return vending.upload(options);
};

vending.upload = async (options) => {
  let outArray = [];
  let profileArray = [];

  let currentDate = new Date();
  const start = currentDate.getTime();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const date = currentDate.getDate();
  const scrapeDate = year + "-" + month + "-" + date;

  try {
    if (fs.existsSync(options.file)) {
      const workbook = xlsx.readFile(options.file);
      const sheet_name_list = workbook.SheetNames;
      //   console.log(xlsx.utils.sheet_to_csv(workbook.Sheets[sheet_name_list[0]]));
      const inputDataSet = xlsx.utils
        .sheet_to_csv(workbook.Sheets[sheet_name_list[0]])
        .trim()
        .split("\n");

      for (line of inputDataSet) {
        const dataArray = line
          .trim()
          .replace(/,+/g, ",")
          .replace(/,$/, "")
          .split(",");

        let profile;
        const dataArrayLength = dataArray.length;
        if (dataArrayLength == 2) {
          profile = {
            create_date: scrapeDate,
            modify_date: scrapeDate,
            platform: dataArray[0],
            user_name: dataArray[1],
          };
        } else if (dataArrayLength > 2) {
          const tempTags = [];
          for (j = 2; j < dataArrayLength; j++) {
            tempTags.push(dataArray[j]);
          }
          profile = {
            create_date: scrapeDate,
            modify_date: scrapeDate,
            platform: dataArray[0],
            user_name: dataArray[1],
            tags: tempTags,
          };
        }
        profileArray.push(profile);
      }
      // console.log("profileArray =>", profileArray);

      //************* Store in the database *************
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

      console.log("Going to save [", profileArray.length, "] records in DB.");
      //Create or update
      if (options.ops == "create") {
        try {
          await UserProfile.collection.insertMany(profileArray, {
            ordered: false,
          });
        } catch (error) {
          mongoose.disconnect();
          // console.log(error);
        }
      } else if (options.ops == "update") {
        try {
          for (element of profileArray) {
            // console.log("updating element =>", element);
            const find_query = {
              platform: element.platform,
              user_name: element.user_name,
            };
            const update_query = {
              $set: { modify_date: scrapeDate, tags: element.tags },
            };
            const option_query = { upsert: true };
            const result = await UserProfile.collection.findOneAndUpdate(
              find_query,
              update_query,
              option_query
            );
            // console.log(result);
          }
        } catch (error) {
          mongoose.disconnect();
          console.log(error);
        }
      } else {
        mongoose.disconnect();
        return {
          status: "FAILED",
          message: "Wrong operation code entered",
        };
      }

      // close DB connection
      mongoose.disconnect();
      //************* Store in the database *************

      return {
        status: "SUCCESS",
        message: "Successfully processed file: [" + options.file + "]",
      };
    } else {
      return {
        status: "FAILED",
        message: "File: [" + options.file + "] doesn't exist.",
      };
    }
  } catch (error) {
    console.log(error);
  }

  console.log(options);
};

module.exports = vending;
