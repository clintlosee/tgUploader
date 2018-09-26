const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs')

const uploadSchema = new mongoose.Schema({
  file: {
    type: String
  },
  slug: String
})

uploadSchema.pre('save', function(next) {
  if (!this.isModified('file')) {
    next() // skip it
    return
  }
  this.slug = slug(this.file)
  next()
})

module.exports = mongoose.model('Upload', uploadSchema)