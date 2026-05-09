// utils/sendEmail.js

const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"AI Notes" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log("Email sent to:", to);

    } catch (error) {
        console.log("Email Error:", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;