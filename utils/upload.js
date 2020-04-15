
const multer = require("multer");

const path = require("path");

const pathToUpload = path.join(__dirname,"../public/uploads");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, pathToUpload)
    },
    filename: function (req, file, cb) {
    //   cb(null, file.fieldname + '-' + Date.now())
    //   
    console.log(file)
    const allows = ["image/gif","image/jpeg", "image/jpg", "image/png"];
    if(!allows.includes(file.mimetype)){
        const error = new Error("filetype is not allowed");
        cb(error, undefined);
    }

    cb(null, file.originalname);
    }
  });
   
  const upload = multer({ storage: storage }).single("fileupload")


  module.exports = upload;