const express = require("express");
const multer = require("multer");
const path = require("path");

const helpers = require("./helpers");
const save = require("./save");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

app.listen(port, () => console.log(`Listening on port ${port}...`));

app.post("/upload-user-profile", (req, res) => {
  let upload = multer({
    storage: storage,
    fileFilter: helpers.docFilter,
  }).single("excel_upload");

  upload(req, res, function (err) {
    // req.file contains information of uploaded file

    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send("Please select a excel document to upload");
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }

    save.saveProfiles(req.file);
    res.send(`You have successfully uploaded file: ${req.file.path}`);
  });
});

app.post("/update-user-profile", (req, res) => {
  let upload = multer({
    storage: storage,
    fileFilter: helpers.docFilter,
  }).single("excel_update");

  upload(req, res, function (err) {
    // req.file contains information of uploaded file

    if (req.fileValidationError) {
      return res.send(req.fileValidationError);
    } else if (!req.file) {
      return res.send("Please select a excel document to update");
    } else if (err instanceof multer.MulterError) {
      return res.send(err);
    } else if (err) {
      return res.send(err);
    }

    save.saveProfiles(req.file);
    res.send(`You have successfully uploaded file: ${req.file.path}`);
  });
});
