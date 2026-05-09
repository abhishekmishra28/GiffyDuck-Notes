// models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        maxlength : 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
    },
    password : {
        type : String,
        required : true,
        minlength : 6,
        select: false
    },
    role : {
        type : String,
        enum : ['user','admin'],
        default : 'user'
    },
    avatar : {
        type : String,
        default : null
    },
    theme : {
        type : String,
        enum: ['dark', 'tokyo-night', 'light', 'solarized'],
        default : 'solarized'
    },
    isActive : {
        type : Boolean,
        default : true
    },
    isBanned : {
        type : Boolean,
        default : false
    },
    aiUsageCount : {
        type : Number,
        default : 0
    },
    aiQuota : {
        type : Number,
        default : 50
    },
    resetPasswordToken : {
        type : String,
        default : null
    },
    resetPasswordExpires : {
        type : Date,
        default : null
    },
    lastActive : {
        type : Date,
        default : Date.now
    },
    verificationOTP : String,
    verificationOTPExpire : Date,
    isVerified : {
        type : Boolean,
        default : false
    },
    otpLastSentAt: Date
}, {
    timestamps : true
});



// Hash Password
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password
userSchema.methods.comparePassword = async function (userPassword) {
    return bcrypt.compare(userPassword, this.password);
};

// Generate reset token
userSchema.methods.generateResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpires = Date.now() + 10*60*1000;
    return resetToken;
};

// OTP Generator
userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationOTP = crypto.createHash('sha256').update(otp).digest("hex");
    this.verificationOTPExpire = Date.now() + 10*60*1000; // 10 Minutes
    return otp;
}


// Hide Sensitive Feilds
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordExpires;
    delete obj.resetPasswordToken;
    return obj;
};


module.exports = mongoose.model('User',userSchema);