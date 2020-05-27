const ScrapeTikTok = require("./scrapeTikTok");

const MAX_RECORDS = 12;

let vending = (options) => {
  // console.log("options =>", options);

  return vending.create(options);
};

vending.create = (options) => {
  if (!options.id) {
    throw new Error("Missing instagram input id");
  }

  if (options.number == 0) {
    options.number = MAX_RECORDS; // set default to 12
  }
  switch (options.scrapeType) {
    case "user":
      return new ScrapeTikTok(options);
  }
};

module.exports = vending;
