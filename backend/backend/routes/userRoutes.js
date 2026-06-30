import express from "express";
import User from "../models/User.js";
import { uploadToCloudinary } from '../lib/cloudinary.js';

const router = express.Router();

// Update user details (including photo) by _id
router.put('/:id', async (req, res) => {
  try {
    const { fullName, email, mobile, location, photo } = req.body;

    if (mobile && !/^[0-9]{10}$/.test(String(mobile))) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    const updateData = { fullName, email, mobile, location, photo };

    // Handle photo upload if photo is provided as base64
    if (updateData.photo && updateData.photo.startsWith('data:image/')) {
      const publicId = `users/photo_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      const result = await uploadToCloudinary(updateData.photo, publicId);
      updateData.photo = result.secure_url;
    }

    // Prevent updating password via this endpoint
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

/* ================= GET ALL USERS ================= */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const totalRecords = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

/* ================= DELETE USER ================= */
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
});



// Get user by ID or fullName
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let query = {};
    
    // Check if the identifier is a valid MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    } else {
      // Otherwise, search by fullName (or email if you want)
      query = { fullName: identifier };
    }

    const user = await User.findOne(query).select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user', error: error.message });
  }
});

export default router;
