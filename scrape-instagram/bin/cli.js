#!/usr/bin/env node

const yargs = require("yargs");

const instaScrape = require("../lib/instance");

const startScraper = async (argv) => {
  try {
    argv.scrapeType = argv._[0];
    argv.cli = true;
    // console.log(argv);
    let scraper = await instaScrape(argv).getPosts();

    console.log({ scraper });
  } catch (error) {
    console.log(error.message);
  }
};

yargs
  .scriptName("scrape-insta")
  .usage("$0 <cmd> [args]")
  .command(
    "user [id]",
    "Scrape posts from the User Feed. Enter only the username",
    {},
    (argv) => {
      startScraper(argv);
    }
  )
  .options({
    number: {
      alias: "n",
      default: 0,
      describe:
        "Number of posts to scrape. If you will set 0 then all posts will be scraped",
    },
  })
  .help().argv;
