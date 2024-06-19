const { getLoggedInUserRole, getLoggedInUserId } = require("../utils/auth.utils");
const CommentModel = require("../models/comment.model");
const UserModel = require("../models/user.model");

const validateUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  next();
}

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
    return res.status(401).json({ success: false, message: "You are not authorized to access this route" });
  }
  const userExists = await UserModel.findById(userId);
  if (!userExists) {
    return res.status(401).json({ success: false, message: "You are not authorized to access this route" });
  }
  next();
}

const checkIfUserExists = async (req, res, next) => {
  const { email } = req.body;
  const userExists = await UserModel.findOne({ email });
  if (!userExists) {
    return res.status(401).json({ success: false, message: "User does not exist" });
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

module.exports = { validateUser , checkIfAdmin , checkIfUserRegistered , checkIfUserExists , checkIfCommentRelatedToUser , isUserVerified }