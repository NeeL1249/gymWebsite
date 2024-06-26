const { getLoggedInUserRole, getLoggedInUserId } = require("../utils/auth.utils");
const { body, validationResult } = require('express-validator');
const CommentModel = require("../models/comment.model");
const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const checkIfAdmin = (req, res, next) => {
    const role = getLoggedInUserRole(req);

  if (role !== "admin") {
    return res.status(401).json({ success: false, message: "You are not authorized to access this route" });
  }

  next();
}

const checkIfUserRegistered = async (req, res, next) => {
  const userId = getLoggedInUserId(req);
  if (!userId) {
    console.log("User not registered")
    return res.status(401).json({ success: false, message: "You are not authorized to access this route" });
  }
  const userExists = await UserModel.findById(userId);
  if (!userExists) {
    console.log("User does not exist")
    return res.status(401).json({ success: false, message: "You are not authorized to access this route" });
  }
  next();
}

const checkIfUserExists = async (req, res, next) => {
  const { email } = req.body;
  const userExists = await UserModel.findOne({ email });
  if (!userExists) {
    return res.status(401).json({ success: false, message: "Invalid Credentials" });
  }
  next();
}

const checkIfCommentRelatedToUser = async (req, res, next) => {
  const userId = getLoggedInUserId(req);
  const commentId = req.params.commentId;
  const comment = await CommentModel.findById({ _id: commentId });
  console.log(comment.creator.toString(), userId)
  if (comment.creator.toString() !== userId) {
    return res.status(401).json({ success: false, message: "You are not authorized to access this route" });
  }
  next();
}

const isUserVerified = async (req, res, next) => {
  const userId = getLoggedInUserId(req);
  const user = await UserModel.findById(userId);
  if (!user.is_verified) {
    return res.status(401).json({ success: false, message: "Please verify your email" });
  }
  next();
}

const verifyToken = (req, res, next) => {
  console.log(req.headers)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid access token" });
  }
};

module.exports = { validateUser , checkIfAdmin , checkIfUserRegistered , checkIfUserExists , checkIfCommentRelatedToUser , isUserVerified, verifyToken }