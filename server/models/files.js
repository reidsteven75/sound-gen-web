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
  bucket: {
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
    NW: {
      type: Number,
      required: true
    },
    NE: {
      type: Number,
      required: true
    },
    SW: {
      type: Number,
      required: true
    },
    SE: {
      type: Number,
      required: true
    }
  }
}, {
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model('files', schema)