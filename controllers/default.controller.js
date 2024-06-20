const bcrypt = require('bcrypt')
const { generateToken } = require('../utils/auth.utils')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const queryModel = require('../models/query.model')
const UserModel = require('../models/user.model')
const BlogModel = require('../models/blog.model');
const CommentModel = require('../models/comment.model');
const PlanModel = require('../models/plan.model');
const { getObjectSignedUrl } = require('../utils/aws.s3');
const { getLoggedInUserId } = require('../utils/auth.utils');
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
        const verificationToken = crypto.randomBytes(32).toString('hex');

        await UserModel.create({
          name: name,
          date_of_birth: dob,
          phone_number: phoneNumber,
          email: email,
          password: hashedPassword,
          roles:role,
          verification_token: verificationToken
        });

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.SMTP_PASSWORD
          }
        });

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Welcome to our platform',
          text: `Please click on the following link to verify your email address: http://localhost:3000/api/verify-email?token=${verificationToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Email sent: ' + info.response);
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

      if (!user.is_verified) {
        return res.status(401).json({ success: false, message: "Please verify your email first." });
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

  const editProfile = async (req,res) => {
    try {
      const userId = getLoggedInUserId(req);
      const { name, dob, phoneNumber } = req.body;
      const user = await UserModel.findById(userId);
      if(name !== undefined){
        user.name = name;
      }
      if(dob !== undefined){
        user.date_of_birth = dob;
      }
      if(phoneNumber !== undefined){
        user.phone_number = phoneNumber;
      }
      await user.save();
      res.status(200).json({success:true,message:"Profile updated successfully."})
    } catch (err) {
      console.log(err)
      res.status(500).json({message:"Some error occured while updating the profile."})
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
      const blog = await BlogModel.findById(blogId).populate('comments');
      res.status(200).json({ success: true, blog });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Some error occurred while getting the blog." });
    }
  };
  
  const getBlogs = async (req, res) => {
    try {
      let blogs = await BlogModel.find().sort('-createdAt');
      
      const blogsPromises = blogs.map(async (blog) => {
        const imageUrl = await getObjectSignedUrl(blog.tile_image);
        return { ...blog.toObject(), imageUrl };
      });

      const blogsWithImages = await Promise.all(blogsPromises);

      res.status(200).json({ success: true, blogsWithImages });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Some error occurred while getting the blogs." });
    }
};

  const logoutUser = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "User logged out successfully" });
  };

  
const commentBlog = async (req,res) => {
  try {
    const blogId = req.params.blogId;
    const { commentContent } = req.body;
    console.log(req.body)
    const userId = getLoggedInUserId(req);
    
    const blog = await BlogModel.findById(blogId);
    console.log(blog)
    const user = await UserModel.findById(userId);

    const comment = await CommentModel.create({
      creator: userId,
      content: commentContent,
      createdAt: new Date()
    });
    console.log(comment)
    console.log(blog.comments)
    blog.comments.push(comment._id);
    user.commentedPosts.push(blogId);
    await blog.save();
    await user.save();

    res.status(200).json({ success: true, message: "Comment added successfully", comment });
  } catch (error) {
    console.log(error)
    res.status(500).json({message: " Some error occured while commenting. "});
  }
}

const replyComment = async (req,res) => {
  const commentId = req.params.commentId;
const { replyContent } = req.body;
try {
  const comment = await CommentModel.findById(commentId)
  const userId = getLoggedInUserId(req)
  
  const reply = await CommentModel.create({
    creator: userId,
    content: replyContent,
    createdAt: new Date()
  })
  console.log(comment)
  console.log(reply)

  comment.replies.push(reply._id)
  await comment.save()

  res.status(200).json({success:true,message:"Replied to the comment successfully"})
} catch (error) {
  console.log(error)
  res.status(500).json({success:false, message:"Some Error Occured while replying."})
}
}

const editComment = async (req,res) => {
try {
  const commentId = req.params.commentId;
  const { commentContent } = req.body;
  const comment = await CommentModel.findById(commentId);
  comment.content = commentContent;
  await comment.save();
  res.status(200).json({success:true,message:"Comment edited successfully."})
} catch (error) {
  console.log(error)
  res.status(500).json({success:false, message:"Some Error Occured while editing the comment."})
}
}

const deleteComment = async (req,res) => {
try {
  const commentId = req.params.commentId;
  await CommentModel.findByIdAndDelete(commentId);
  res.status(200).json({success:true,message:"Comment deleted successfully."})
} catch (err) {
  console.log(err)
  res.status(500).json({message:"Some error occured while deleting the comment."})
}
}

const getPlans = async (req,res) => {
  try {
    const plans = await PlanModel.find();
    res.status(200).json({success:true,plans})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"Some error occured while getting the plans."})
  }
}

const getPlan = async (req,res) => {
  try {
    const planId = req.params.planId;
    const plan = await PlanModel.findById(planId);
    res.status(200).json({success:true,plan})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"Some error occured while getting the plan."})
  }
}


const verifyEmail = async (req, res) => {
  const token = req.query.token;
  try {
    const result = await UserModel.findOne({ verification_token: token });

    if (!result) {
      return res.status(400).json({ message: 'Invalid token' });
    } else {
      result.is_verified = true;
      result.verification_token = null;
      await result.save();
      res.status(200).json({ message: 'Email verified successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { 
  queries,
  registerUser, 
  loginUser, 
  editProfile,
  changePassword, 
  forgetPassword, 
  getBlog, 
  getBlogs, 
  logoutUser,
  commentBlog,
  replyComment,
  editComment,
  deleteComment,
  getPlans,
  getPlan,
  verifyEmail
};