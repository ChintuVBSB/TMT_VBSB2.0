// utils/mailer.js
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,     // ✅ your email
    pass: process.env.MAIL_PASS,  // ✅ your app password (not your main Gmail pass!)
  },
});
