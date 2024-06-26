const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "You have exceeded the 100 requests in 15 minutes limit!",
    headers: true,
    });

module.exports = { authLimiter };