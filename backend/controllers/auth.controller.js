const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const { generateAccessToken } = require("../utils/auth.utils");

const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;
  
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "Refresh token not found" });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const storedToken = await RefreshToken.findOne({ user: decoded.userId, token: refreshToken });
  
      if (!storedToken) {
        return res.status(403).json({ success: false, message: "Invalid refresh token" });
      }
  
      const user = await UserModel.findById(decoded.userId);
      const newAccessToken = generateAccessToken(user);
  
      res.json({ success: true, accessToken: newAccessToken });
    } catch (error) {
      console.error(error);
      res.status(403).json({ success: false, message: "Invalid refresh token" });
    }
  };

  module.exports = {refreshToken};