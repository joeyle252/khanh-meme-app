var express = require('express');
var router = express.Router();
var jimp = require('jimp');
const path = require("path");
const upload = require("../utils/upload");
const { loadData, saveData } = require("../utils/data.js");

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
    image.resize(250, jimp.AUTO, jimp.RESIZE_NEAREST_NEIGHBOR);
    await image.writeAsync(file.path);

    image.id = data.length === 0 ? 1 : data[data.length - 1].id + 1
    data.push(file);
    saveData(data);

    res.render("allimages", { images: data })
  } catch (e) {// error object
    fs.unlinkSync(file.path);
    return res.render("index", { error: e.message })
  }
})

/*
router.post('/upload', upload, async function (req, res, next) {
  if (!req.file) {
    res.render("allimages", { error: "you need to upload a file" })
  };
  const pathToUpload = path.join(__dirname,"../public/uploads");
  const data = loadData();
  const name = `${req.file.filename.split('.')[0]}_150x150.jpg`
  const image = await Jimp.read(req.file.path);
  await image.resize(Jimp.AUTO, 300, Jimp.RESIZE_BEZIER);
  await image.writeAsync(`${pathToUpload}/${name}`);
  const newFile = {filename:name}
  data.push(newFile)
  saveData(data);
  setTimeout(()=>{
    res.render("allimages", { images: data })
  },8000)
});
*/


module.exports = router;
