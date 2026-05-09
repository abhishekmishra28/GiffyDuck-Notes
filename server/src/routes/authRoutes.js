// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const {register, login, forgotPassword, resetPassword, verifyOTP, resendOTP} = require("../controllers/authController");
const {protect, authorize} = require("../middlewares/authMiddleware");
const { authLimiter, otpLimiter } = require("../middlewares/rateLimiter");


router.get('/me', protect, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            theme: req.user.theme,
            avatar: req.user.avatar,
            aiUsageCount: req.user.aiUsageCount,
            aiQuota: req.user.aiQuota,
            lastActive: req.user.lastActive,
            createdAt: req.user.createdAt,
        }
    });
});

router.put('/update-theme', protect, async (req, res) => {
    try {
        const { theme } = req.body;
        const validThemes = ['dark', 'tokyo-night', 'light', 'solarized'];
        if (!validThemes.includes(theme)) {
            return res.status(400).json({ success: false, message: 'Invalid theme' });
        }
        req.user.theme = theme;
        req.user.lastActive = Date.now();
        await req.user.save({ validateBeforeSave: false });
        res.json({ success: true, theme });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Only Logged in Users
router.get('/dashboard', protect, (req,res) => {
    res.json({
        success : true,
        message : `Welcome, ${req.user.name}`
    });
});

// Only Admin
router.get('/admin', protect, authorize('admin'), (req,res) => {
    res.json({
        success : true,
        message :  `Welcome, ${req.user.name}`
    });
});

router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

module.exports = router;