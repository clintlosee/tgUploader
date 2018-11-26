const mongoose = require('mongoose')
const Upload = mongoose.model('Upload')
const multer = require('multer')
const uuid = require('uuid/v4')
const fs = require('fs')
const path = require('path')
const dirTree = require('directory-tree')

let directory = './public/uploads'

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const tag = req.body.tag
    if (tag) {
      directory = `./public/uploads/${tag}`
    }
    cb(null, directory)
  },
  filename: function(req, file, cb) {
    const uid = uuid().split('-').slice(0, 1).join('');
    cb(null, file.originalname)
  }
})

function getDate() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth()+1;
  let yyyy = today.getFullYear();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  if(dd<10){
    dd='0'+dd;
  }
  if(mm<10){
      mm='0'+mm;
  }
  today = mm+'/'+dd+'/'+yyyy+' '+h+':'+m+':'+s;
  return today;
}

const multerOptions = {
  storage: storage,
  fileFilter(req, file, next) {
    const isApp = file.mimetype.startsWith('application/')
    const isPhoto = file.mimetype.startsWith('image/')
    if (isApp || isPhoto) {
      next(null, true)
    } else {
      next({ message: "That filetype isn't allowed" }, false)
    }
  }
}

exports.homePage = (req, res) => {
  res.render('index', { title: 'Home' })
}

exports.file = async (req, res) => {
  const uploads = await Upload.find()
  const fullUrl = `${req.protocol}://${req.get('host')}`
  let heading = 'Upload URL'
  if (uploads.length > 1) {
    heading = 'Upload URLs'
  }
  res.render('upload', { title: 'Upload File', heading, url: fullUrl, uploads })
}

exports.upload = multer(multerOptions).single('file')

exports.rework = async (req, res, next) => {
  if (!req.file) {
    next()
    return
  }

  req.body.file = req.file.originalname
  next()
}

exports.uploadFile = async (req, res) => {
  const upload = new Upload(req.body)
  await upload.save()
  req.flash('success', `Successfully uploaded ${upload.file}. See URL below.`)
  res.redirect('/')
}

exports.listFiles = async (req, res) => {
  const tree = dirTree(directory, (item, path) => {
    files = item
  })
  res.json({ uploads: tree })
}

exports.deleteFiles = async (req, res) => {
  let todayDate = getDate()

  fs.readdir(directory, (err, files) => {
    if (err) throw err

    for (const file of files) {
      if (file === '.gitkeep') {
        continue
      } else if (file === 'QA' || file === 'Release') {
        let newDir = path.join(directory, file)
        fs.readdir(newDir, (err, secondaryFiles) => {
          for (const newfile of secondaryFiles) {
            if (newfile === '.gitkeep') {
              continue
            }
            fs.unlink(path.join(newDir, newfile), err => {
              if (err) throw err;
            })
          }
        })
      } else {
        fs.unlink(path.join(directory, file), err => {
          if (err) throw err;
        })
      }
    }
  })

  console.log(`Deleting files ${todayDate}`)
  await Upload.deleteMany({})
  req.flash('success', `Successfully Deleted All Files & Records`)
  res.redirect('/')
}
