const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  creator: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tile_image : {
    type: String,
    required: true
  }
});

const BlogModel = mongoose.model('Blog', BlogSchema);

module.exports = BlogModel;
