#!/usr/bin/env node

const yargs = require("yargs");

const scrapeProfile = require("./lib/scrape-profile");
const uploadProfile = require("./lib/upload-profiles");
const intialSetup = require("./lib/initial_setup");

const startScraper = async (argv) => {
  try {
    argv.action = argv._[0];
    argv.cli = true;
    // console.log(argv);
    let result;
    if (argv.action == "scrape") {
      result = "going to scrape profiles";
      result = await scrapeProfile(argv);
    } else if (argv.action == "upload") {
      result = "going to load user profiles from excel files";
      result = await uploadProfile(argv);
    } else if (argv.action == "setup") {
      result = await intialSetup();
    } else {
      result = "wrong action input";
    }

    console.log(result);
  } catch (error) {
    console.log(error.message);
  }
};

yargs
  .scriptName("scrape-profile")
  .usage("$0 <cmd> [args]")
  .command(
    "scrape [type]",
    "Enter type either tiktok or instagram ",
    {},
    (argv) => {
      startScraper(argv);
    }
  )
  .command(
    "upload [ops]",
    "Upload user profile details from the excel document into database. Enter operation as create or update",
    {},
    (argv) => {
      startScraper(argv);
    }
  )
  .command(
    "setup",
    "Perform initial database setup like creating required indexes",
    {},
    (argv) => {
      startScraper(argv);
    }
  )
  .options({
    count: {
      alias: "c",
      default: 0,
      describe:
        "Number of user profiles to scrape. If you will set 0 then all profiles will be scraped",
    },
    file: {
      alias: "f",
      default: "",
      describe: "Excel report with user profile details",
    },
  })
  .help().argv;
