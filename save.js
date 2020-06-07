const uploadProfile = require("./scrape-profiles/lib/upload-profiles");

const saveProfiles = async (inputs) => {
  //   console.log("inputs =>", inputs);
  let operation = "";
  const fileName = inputs.path;
  if (inputs.fieldname == "excel_upload") {
    operation = "create";
  } else if (inputs.fieldname == "excel_update") {
    operation = "update";
  }
  const options = { file: fileName, ops: operation };
  result = await uploadProfile(options);
  console.log(result);
  return result;
};

exports.saveProfiles = saveProfiles;
