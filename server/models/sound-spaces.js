const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  user: {
    type: String,
    trim: true,
    required: true
  },
  dimensions: {
    type: Number,
    required: true
  },
  resolution: {
    type: Number,
    required: true
  },
  labels: {
    NW: {
      type: String,
      trim: true, 
      required: true
    },
    NE: {
      type: String,
      trim: true, 
      required: true
    },
    SW: {
      type: String,
      trim: true, 
      required: true
    },
    SE: {
      type: String,
      trim: true, 
      required: true
    }
  },
  fileLocation: {
    service: {
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
    }
  },
}, {
  timestamps: true,
  versionKey: false
})

module.exports = mongoose.model('sound-spaces', schema)