var express = require('express');
var router = express.Router();
var Jimp = require('jimp');
const upload = require("../utils/upload");
const { loadData, saveData } = require("../utils/data.js");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: "Khanh's Meme app" });
});

router.get("/browser", (req, res) => {
  const data = loadData();
  res.render("allimages", { iamges: data })
});

router.post('/upload', upload, function (req, res, next) {
  console.log("req file",req.file)
  if (!req.file) {
    res.render("allimages", { error: "you need to upload a file" })
  };
  const data = loadData();
  Jimp.read(req.file.path, (err, pic) => {
    console.log("pic",pic)
    if (err) throw err;
    pic
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality
      .greyscale() // set greyscale
      .write(req.file.path, ()=>{
        data.push(req.file)
        saveData(data);
        res.render("allimages", { images: data })
      }); // save
    
  });
      
  
 
});

module.exports = router;
