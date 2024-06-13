const { getLoggedInUserRole } = require("../utils/auth.utils");

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

module.exports = { validateUser , checkIfAdmin }