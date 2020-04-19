var express = require('express');
var router = express.Router();
var jimp = require('jimp');
const path = require("path");
const fs = require("fs")
const upload = require("../utils/upload");
const { loadData, saveData, loadMemeData, saveMemeData } = require("../utils/data.js");

const pathToMemepictures = path.join(__dirname, '../public/memepictures')
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: "Khanh's Meme app" });
});

router.get("/browser", (req, res) => {
  const data = loadData();
  res.render("allimages", { images: data })
});

router.post("/upload", upload, async (req, res) => {
  
  const {file} = req;
  
  console.log({file})
  if (!file) {
    return res.render("index", { error: "you need to upload a file" })
  };
  const data = loadData();
  const found = data.findIndex(el => el.originalname === file.originalname || el.size === file.size);
  if (found !== -1) {
    //check size of 2 files
    return res.render("index", { error: "duplicated file, please choose an other" })
  }
  try {
    let image = await jimp.read(file.path);
    image.resize(250, 250, jimp.RESIZE_NEAREST_NEIGHBOR);
    await image.writeAsync(file.path);

    file.id = data.length === 0 ? 1 : data[data.length - 1].id + 1;
    data.push(file);
    saveData(data);

    res.render("allimages", { images: data });
  } catch (e) {// error object
    fs.unlinkSync(file.path);
    return res.render("index", { error: e.message })
  }
});

router.post("/addmeme", async (req, res) => {

  const {top, bottom,id} = req.body;
  if(!id ){
    return res.render("error", {message: "please submit an ID"})
  }
  if (!top && !bottom){
    return res.render('error',{message:"please submit some text"})
  }
  const data = loadData()
  const selectedImageIndex = data.findIndex(image=>image.id === id*1)
  if(selectedImageIndex === -1){
    return res.render('error', {message: "please submit some text"})
  }
  const selectedImage = data[selectedImageIndex]
  let image = await jimp.read(selectedImage.path);
  const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
  image.print(
    font,
    0,0,
    {
      text: top,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_TOP
    },
    image.bitmap.width,
    image.bitmap.height,
  );
  image.print(
    font,
    0,0,
    {
      text: bottom,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_BOTTOM
    },
    image.bitmap.width,
    image.bitmap.height,
  );

let newName = Date.now().toString()+ selectedImage.filename
  await image.writeAsync(`${pathToMemepictures}/${newName}`)

  const memeData = loadMemeData();
  let newmemeData = {
    id: memeData.length > 0 ? memeData[memeData.length-1].id +1 : 1,
    path: `${pathToMemepictures}/${newName}`,
    filename: newName
  }
  memeData.push(newmemeData);
  saveMemeData(memeData);
  res.render('allmemeimages', {images: memeData})
 });

router.get("/meme", async (req, res) => {
  const memeData = loadMemeData();
  res.render('allmemeimages', {images: memeData})

});

module.exports = router;
