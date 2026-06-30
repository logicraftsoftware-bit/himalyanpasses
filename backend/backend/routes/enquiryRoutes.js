import express from "express";
import Enquiry from "../models/Enquiry.js";

const router = express.Router();


// CREATE ENQUIRY
router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      numberOfPerson,
      message,
    } = req.body;

    if (!fullName || !contactNumber || !numberOfPerson) {
      return res.status(400).json({
        success: false,
        message: "Full name, contact number and number of person are required",
      });
    }

    // mobile validation
    if (!/^[0-9]{10}$/.test(String(contactNumber))) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    // email validation if provided
    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const enquiry = await Enquiry.create({
      fullName: fullName.trim(),
      email: email ? email.trim().toLowerCase() : "",
      contactNumber: String(contactNumber).trim(),
      numberOfPerson: Number(numberOfPerson),
      message: message ? message.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit enquiry",
      error: error.message,
    });
  }
});


// GET ALL ENQUIRIES WITH PAGINATION
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
        { contactNumber: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const totalRecords = await Enquiry.countDocuments(query);

    const enquiries = await Enquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
      error: error.message,
    });
  }
});


// GET SINGLE ENQUIRY
router.get("/:id", async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry",
      error: error.message,
    });
  }
});


// UPDATE ENQUIRY
router.put("/:id", async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      numberOfPerson,
      message,
      isActive,
    } = req.body;

    if (contactNumber && !/^[0-9]{10}$/.test(String(contactNumber))) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        ...(fullName !== undefined && { fullName: fullName.trim() }),
        ...(email !== undefined && { email: email.trim().toLowerCase() }),
        ...(contactNumber !== undefined && {
          contactNumber: String(contactNumber).trim(),
        }),
        ...(numberOfPerson !== undefined && {
          numberOfPerson: Number(numberOfPerson),
        }),
        ...(message !== undefined && { message: message.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      data: updatedEnquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update enquiry",
      error: error.message,
    });
  }
});


// DELETE ENQUIRY
router.delete("/:id", async (req, res) => {
  try {
    const deletedEnquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!deletedEnquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete enquiry",
      error: error.message,
    });
  }
});

export default router;