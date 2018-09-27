const mongoose = require('mongoose')
const Upload = mongoose.model('Upload')
const multer = require('multer')
const uuid = require('uuid')
const fs = require('fs')
const path = require('path')

const directory = './public/uploads'

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, directory)
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})

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
  if (uploads.length > 0) {
    heading = 'Upload URLs'
  }
  res.render('upload', { title: 'Upload ARC File', heading, url: fullUrl, uploads })
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
  const fullUrl = `${req.protocol}://${req.get('host')}`
  const upload = new Upload(req.body)
  await upload.save()
  req.flash('success', `Successfully Uploaded ${upload.file}. URL is ${fullUrl}uploads/${upload.file}`)
  res.redirect('/')
}

exports.deleteFiles = async (req, res) => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err

    for (const file of files) {
      if (file === '.gitkeep') {
        console.log('skipped')
        continue
      }

      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      })
    }
  })
  await Upload.remove({})
  req.flash('success', `Successfully Deleted All Files & Records`)
  res.redirect('/')
}