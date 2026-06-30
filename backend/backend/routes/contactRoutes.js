import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

// Submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, phoneNumber, message } = req.body;

    if (!name || !email || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^[0-9]{10}$/.test(String(phoneNumber))) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phoneNumber,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// Get all contact submissions (for admin)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const totalRecords = await Contact.countDocuments(query);
    const submissions = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: submissions,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
});

// Update status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const submission = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!submission) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete submission
router.delete("/:id", async (req, res) => {
  try {
    const submission = await Contact.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
