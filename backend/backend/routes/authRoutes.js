import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

function requireJwtSecret(res) {
  if (JWT_SECRET) return true;

  res.status(500).json({
    success: false,
    message: "JWT_SECRET is not configured",
  });
  return false;
}

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    if (!requireJwtSecret(res)) return;

    const { fullName, mobile, phone, email, password, location, role } = req.body;
    const finalMobile = mobile || phone;

    if (!fullName || !finalMobile || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required (fullName, mobile/phone, email, password)" 
      });
    }

    if (!/^[0-9]{10}$/.test(String(finalMobile))) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Only allow 'admin' or 'user'. Default = admin for dashboard access.
    const userRole = role === "user" ? "user" : "admin";
    const user = await User.create({ fullName, email, mobile: finalMobile, password, location, role: userRole });

    const token = jwt.sign(
      { id: user._id, email: user.email, mobile: user.mobile, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: { id: user._id, fullName: user.fullName, mobile: user.mobile, email: user.email, location: user.location, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Signup failed", error: error.message });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    if (!requireJwtSecret(res)) return;

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // JWT now includes role so middleware can enforce admin-only routes
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, mobile: user.mobile, location: user.location, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
});

/* ================= LOGOUT ================= */
router.post("/logout", (req, res) => {
  // For stateless JWT, logout is primarily handled on the frontend.
  // We can add logic here if we implement a token blacklist.
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

/* ================= GET CURRENT USER (verify token) ================= */
router.get("/me", async (req, res) => {
  try {
    if (!requireJwtSecret(res)) return;

    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = otpExpire;
    await user.save();

    const message = `Your password reset OTP is: ${otp}. It will expire in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP",
        message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="font-size: 16px; color: #555;">Hello ${user.fullName},</p>
            <p style="font-size: 16px; color: #555;">You requested to reset your password. Use the OTP below to proceed:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #888;">This OTP is valid for 10 minutes only. If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Glacier. All rights reserved.</p>
          </div>
        `,
      });

      res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (emailError) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: "Email could not be sent", error: emailError.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Forgot password failed", error: error.message });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "OTP verification failed", error: error.message });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP and new password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Password reset failed", error: error.message });
  }
});

export default router;
