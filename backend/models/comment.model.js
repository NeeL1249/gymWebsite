const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  creator: {
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
  }
});

const CommentModel = mongoose.model('Comment', CommentSchema);

module.exports = CommentModel;
