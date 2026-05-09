// middlewares/rateLimiter.js

const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
    windowMs : 15*60*1000,
    max : 100,
    message : {
        success : false,
        message : "Too many requests, Please, try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs : 1*60*1000,
    max : 5,
    message : {
        success : false,
        message : "Too many attempts, please try again after 1 minute."
    }
});

const otpLimiter = rateLimit({
    windowMs : 1*60*1000,
    max : 2,
    message : {
        success : false,
        message : "Too many OTP requests, please wait."
    }
});

const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        success: false,
        message: "Too many chat requests. Please slow down."
    }
});


module.exports = {
    globalLimiter,
    authLimiter,
    otpLimiter,
    chatLimiter
}