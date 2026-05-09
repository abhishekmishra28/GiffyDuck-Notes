// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// protect middleware
exports.protect = async (req,res,next) => {
    try {
        let token;
        // Get Token From Header
        if(req.headers.authorization  && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Not Authorized. No Token Found."
            });
        }

        // Verify Token
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        // Get User from DB
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Attach user to request
        req.user = user;
        next();
    }catch(error){
        return res.status(401).json({
            success : false,
            message : "Invalid Token."
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Access Denied"
            });
        }
        next();
    };
};