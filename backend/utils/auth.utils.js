const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshToken.model");
const rateLimit = require("express-rate-limit");

const generateToken = (user) => {
    const payload = {
      id: user._id,
      role: user.roles
    };
    console.log(payload)
    const secret = process.env.JWT_SECRET
    const options = {
      expiresIn: '365d',
    };
    return jwt.sign(payload, secret, options);
  };
  
  const getLoggedInUserId = (req) => {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      throw new Error("User not authenticated");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.userId;
  };

  const getLoggedInUserRole = (req) => {
    const token = req.headers.cookie.split("=")[1];
    if (!token) {
      throw new Error("User not authenticated");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    return decodedToken.role;
  }

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "You have exceeded the 100 requests in 15 minutes limit!",
    headers: true,
  });

  const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
  };
  
  const generateRefreshToken = async (user) => {
    console.log(user)
    const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  
    return refreshToken;
  };

  module.exports = { generateToken, getLoggedInUserId, getLoggedInUserRole, authLimiter, generateAccessToken, generateRefreshToken};