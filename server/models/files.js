const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  soundSpace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sound-spaces'
  },
  file: {
    type: String,
    trim: true,
    required: true
  },
  path: {
    type: String,
    trim: true,
    required: true
  },
  latentSpace: {
    type: Array,
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model('files', schema)