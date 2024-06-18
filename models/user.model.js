const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    date_of_birth: {
      type: Date,
      required: true
    },
    phone_number: {
      type: String,
      validate: {
        validator: function(v) {
          return /\d{10}/.test(v)
        },
        message: props => `${props.value} is not a valid Phone Numebr!`
      }
    },
    email : {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email!`
      }
    },
    password: {
      type: String,
      required: true
    },
    roles: {
      type: String,
      enum: ['user','admin'],
      default: 'user'
    },
    commentedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }]
  })
  
const UserModel = mongoose.model("user",UserSchema);

module.exports = UserModel;