const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: String,
  expiresAt: Date
});

const refreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = refreshTokenModel;