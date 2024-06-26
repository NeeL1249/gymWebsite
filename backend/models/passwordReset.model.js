const mongoose = require('mongoose');

const PasswordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true
    }
});

const PasswordResetModel = mongoose.model("password_reset", PasswordResetSchema);

module.exports = PasswordResetModel;