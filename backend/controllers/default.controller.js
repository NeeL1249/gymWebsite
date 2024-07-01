const bcrypt = require('bcryptjs')
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.utils')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const queryModel = require('../models/query.model')
const UserModel = require('../models/user.model')
const BlogModel = require('../models/blog.model');
const CommentModel = require('../models/comment.model');
const ChallengeModel = require('../models/challenges.model');
const PlanModel = require('../models/plan.model');
const RefreshToken = require('../models/refreshToken.model');
const { getObjectSignedUrl } = require('../utils/aws.s3');
const { getLoggedInUserId } = require('../utils/auth.utils');
const setUpdatedFields = require('../utils/updateFields');
const PasswordResetModel = require('../models/passwordReset.model');
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
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred during login" });
  }
};

  const editProfile = async (req,res) => {
    try {
      const userId = getLoggedInUserId(req);
      const { name, dob, phoneNumber } = req.body;
      const user = await UserModel.findById(userId);
      setUpdatedFields(user, { name, date_of_birth: dob, phone_number: phoneNumber });
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
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      await PasswordResetModel.create({
        email: email,
        token: resetToken,
        expiry: new Date(Date.now() + 3600000)
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
        subject: 'Reset Password',
        text: `Please click on the following link to reset your password: http://localhost:3000/api/reset-password?token=${resetToken}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Email sent: ' + info.response);
      }
      );
      res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred while resetting the password" });
    }
  }

  const resetPassword = async (req,res) => {
    try {
      const token = req.query.token;
      const { password } = req.body;
      const reset = await PasswordResetModel.findOne({ token });
      console.log(reset)
      if (!reset) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }
      const user = await UserModel.findOne({ email: reset.email });
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
      await user.save();
      await PasswordResetModel.deleteOne({ token });
      res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, message: "An error occurred while resetting the password" });
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
      const imageUrl = await getObjectSignedUrl(blog.tile_image);
      res.status(200).json({ success: true, blog ,imageUrl });
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
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: "Logged out successfully" });
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
    let plans = await PlanModel.find()
      
      const plansPromises = plans.map(async (plan) => {
        const imageUrl = await getObjectSignedUrl(plan.tile_image);
        return { ...plan.toObject(), imageUrl };
      });

      const plansWithImages = await Promise.all(plansPromises);
    res.status(200).json({success:true,plansWithImages})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"Some error occured while getting the plans."})
  }
}

const getPlan = async (req,res) => {
  try {
    const planId = req.params.planId;
    const plan = await PlanModel.findById(planId);
    const imageUrl = await getObjectSignedUrl(plan.tile_image);
    res.status(200).json({success:true,plan,imageUrl})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"Some error occured while getting the plan."})
  }
}

const getChallenges = async (req,res) => {
  try {
    let challenges = await ChallengeModel.find()
      
      const challengesPromises = challenges.map(async (challenge) => {
        const imageUrl = await getObjectSignedUrl(challenge.tile_image);
        return { ...challenge.toObject(), imageUrl };
      });

      const challengesWithImages = await Promise.all(challengesPromises);
    res.status(200).json({success:true,challengesWithImages})
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"Some error occured while getting the challenges."})
  }
}

const getChallenge = async (req,res) => {
  try {
    const challengeId = req.params.challengeId;
    const challenge = await ChallengeModel.findById(challengeId);
    const imageUrl = await getObjectSignedUrl(challenge.tile_image);
    res.status(200).json({success:true,challenge,imageUrl})
  }
  catch (error) {
    console.log(error)
    res.status(500).json({success:false,message:"Some error occured while getting the challenge."})
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
  resetPassword,
  getBlog, 
  getBlogs, 
  logoutUser,
  commentBlog,
  editComment,
  deleteComment,
  getPlans,
  getPlan,
  getChallenges,
  getChallenge,
  verifyEmail
};