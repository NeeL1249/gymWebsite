const bcrypt = require('bcrypt')
const { generateToken } = require('../utils/auth.utils')
const queryModel = require('../models/query.model')
const UserModel = require('../models/user.model')
const BlogModel = require('../models/blog.model');
const saltRounds = 10;

const queries = async (req, res) => {
    try {
      const { firstName, lastName, email, message } = req.body;

      await queryModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        message: message
      });
      
      res.status(200).json({ success: true, message: "Query submitted successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred while submitting the query" });
    }
  }

const registerUser = async (req, res) => {
    try {
        const { name, dob, phoneNumber, email, password, role } = req.body;
        console.log(req.body)
        const userExists = await UserModel.findOne({ email: email });
    
        if (userExists) {
        return res.status(409).json({ success: false, message: "User already exists" });
        }
    
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await UserModel.create({
        name: name,
        date_of_birth: dob,
        phone_number: phoneNumber,
        email: email,
        password: hashedPassword,
        roles:role
        });
    
        res.status(201).json({ success: true, message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "An error occurred while registering the user" });
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ success: false, message: "User not registered. Please register first." });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect Password" });
      }
  
      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
  
      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        userId: user._id,
        token,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred while logging in" });
    }
  }

  const forgetPassword = async (req,res) => {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(401).json({ success: false, message: "User not registered. Please register first." });
      }

      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ success: true, message: "Token sent to email" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred while sending the token" });
    }
  }

  const changePassword = async (req,res) => {
    try {
      const userId = getLoggedInUserId(req);
      const { oldPassword, newPassword } = req.body;
      const user = await UserModel.findById(userId);
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect Password" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred while changing the password" });
    }
  }
  
  const getBlog = async (req, res) => {
    try {
      const { blogId } = req.params;
      const blog = await BlogModel.findById(blogId).populate('creator');
      res.status(200).json({ success: true, blog });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Some error occurred while getting the blog." });
    }
  };
  
  const getBlogs = async (req, res) => {
    try {
      const blogs = await BlogModel.find().populate('creator');
      res.status(200).json({ success: true, blogs });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Some error occurred while getting the blogs." });
    }
  };

  const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "User logged out successfully" });
  };


module.exports = { 
  queries,
  registerUser, 
  loginUser, 
  changePassword, 
  forgetPassword, 
  getBlog, 
  getBlogs, 
  logoutUser 
};