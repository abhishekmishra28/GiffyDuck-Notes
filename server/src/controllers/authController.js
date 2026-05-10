// controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        {id : user._id, role : user.role},
        process.env.JWT_SECRET,
        {expiresIn : '7d'}
    );
};

// Register Controller
exports.register = async (req,res) => {
    try{
        const {name,email,password} = req.body; 
        // 1. Validation
        if(!name || !email ||!password){
            return res.status(400).json({
                success : false,
                message : "All fields are required."
            });
        }
        // 2. Check existing user
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User already exist."
            });
        }
        // 3. Create User
        const user = await User.create({
            name,
            email,
            password
        });
        // 4. Generate Token
        // const token = generateToken(user);

        // 4. Generate OTP
        const otp = user.generateOTP();
        // 5. Save OTP
        await user.save({validateBeforeSave : false});

        // Send Email
        await sendEmail({
            to: email,
            subject: "Verify Your Email - AI Notes",
            html: `
                <h2>Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
            `
        });

        // 5. Send Response
        res.status(201).json({
            success: true,
            message: "OTP sent to email",
        });
    }catch(error){
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
};

// Login Controller
exports.login = async (req,res) => {
    try{
        const {email,password} = req.body;
        // 1. Validation
        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "All fields are required."
            });
        }
        // 2. check existing user
        const user = await User.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({
                success : false,
                message : "Invalid Credentials"
            });
        }
        // 3. check if banned
        if(user.isBanned){
            return res.status(403).json({
                success: false,
                message: "User is banned."
            });
        }

        // 4. Match Password
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({
                success : false,
                message : "Incorrect Password."
            });
        }
        // In exports.login, after password match:
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first."
            });
        }

        // Generate Token
        const token = generateToken(user);
        res.status(200).json({
            success : true,
            message : "Logged in Successfully.",
            token,
            user : user
        });


    }catch(error){
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        // 2. Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 3. Generate reset token
        const resetToken = user.generateResetToken();

        await user.save({ validateBeforeSave: false });

        // 4. Create reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.giffyduck.com';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // 5. Send Email ✅
        await sendEmail({
            to: user.email, // ✅ FIXED
            subject: "Password Reset - AI Notes",
            html: `
                <h2>Password Reset</h2>
                <p>Click below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link expires in 10 minutes.</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Reset link sent to email"
        });

    } catch (error) {
        console.log("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // 1. Validate
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required."
            });
        }

        // 2. Hash token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // 3. Find user
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        // ❗ IMPORTANT FIX
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // 4. Set new password
        user.password = password;

        // 5. Clear fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });

    } catch (error) {
        console.log("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req,res) => {
    try {
        const { email, otp } = req.body;
        if(!email || !otp){
            return res.status(400).json({
                success : false,
                message : "Email and OTP are required."
            });
        }
        const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
        const user = await User.findOne({
            email,
            verificationOTP : hashedOTP,
            verificationOTPExpire : { $gt : Date.now() }
        });
        if(!user){
            return res.status(400).json({
                success : false,
                message : "Invalid or Expired OTP."
            });
        }
        user.isVerified = true;
        user.verificationOTP = undefined;
        user.verificationOTPExpire = undefined;

        await user.save();
        const token = generateToken(user);
        res.status(200).json({
            success : true,
            message : "Account verified Successfully.",
            token
        });

    }catch(error){
        res.status(500).json({
            success : false,
            message : error.message
        });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // 2. Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 3. Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User already verified"
            });
        }

        // 4. Cooldown check (60 seconds)
        if (user.otpLastSentAt) {
            const diff = Date.now() - user.otpLastSentAt;

            if (diff < 60 * 1000) {
                return res.status(429).json({
                    success: false,
                    message: "Please wait before requesting OTP again"
                });
            }
        }

        // 5. Generate new OTP
        const otp = user.generateOTP();

        // 6. Update timestamp
        user.otpLastSentAt = Date.now();

        await user.save({ validateBeforeSave: false });

        // 7. Send email
        await sendEmail({
            to: email,
            subject: "Resend OTP - AI Notes",
            html: `
                <h2>Email Verification</h2>
                <p>Your new OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP expires in 10 minutes.</p>
            `
        });

        res.status(200).json({
            success: true,
            message: "OTP resent successfully"
        });

    } catch (error) {
        console.log("Resend OTP Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};