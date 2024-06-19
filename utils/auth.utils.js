const jwt = require("jsonwebtoken");

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
    const token = req.headers.cookie.split("=")[1];
    if (!token) {
      throw new Error("User not authenticated");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken)
    return decodedToken.id;
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

  module.exports = { generateToken, getLoggedInUserId, getLoggedInUserRole };