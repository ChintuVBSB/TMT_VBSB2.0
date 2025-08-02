
import User from '../models/user.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../../utils/sendOtpMail.js";
import { generateOTP } from '../helpers/otpgenerator.js';
 

// 🔐 Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Not an admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔐 Manager Login
export const managerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "manager") {
      return res.status(403).json({ message: "Access denied: Not a manager" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔐 Team Member Login
export const teamLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.role !== "staff") {
      return res.status(403).json({ message: "Access denied: Not a staff" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = otp;
  user.otp_expiry = Date.now() + 2 * 60 * 1000;
  await user.save();

  await sendOTPEmail(user.email, otp); // 📧

  res.json({ msg: "OTP sent on mail", userId: user._id });
};

 

export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ msg: "User not found" });

  if (user.otp !== otp || Date.now() > user.otp_expiry) {
    return res.status(400).json({ msg: "Invalid or expired OTP" });
  }

  user.otp = null;
  user.otp_expiry = null;
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resendOTP =  async (req, res) => {
  const { userId } = req.body;

  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate OTP logic
    const otp = generateOTP(); // e.g. random 6-digit
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // send OTP to email
    await sendOTPEmail(user.email, otp);

    res.json({ message: "OTP resent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
}
