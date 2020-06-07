const docFilter = function (req, file, cb) {
  // Accept excel document only
  if (!file.originalname.match(/\.(xlsx|xls)$/)) {
    req.fileValidationError = "Only excel files are allowed!";
    return cb(new Error("Only excel files are allowed!"), false);
  }
  cb(null, true);
};
exports.docFilter = docFilter;
