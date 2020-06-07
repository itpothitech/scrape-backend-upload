const uploadProfile = require("./scrape-profiles/lib/upload-profiles");

const saveProfiles = async (inputs) => {
  let operation = "update";
  const fileName = inputs.path;

  const options = { file: fileName, ops: operation };
  console.log(options);
  result = await uploadProfile(options);
  console.log(result);
  return result;
};

exports.saveProfiles = saveProfiles;
