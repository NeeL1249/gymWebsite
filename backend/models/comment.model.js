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
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

const CommentModel = mongoose.model('Comment', CommentSchema);

module.exports = CommentModel;
