import express from "express";
import PackageEnquiry from "../models/PackageEnquiry.js";

const router = express.Router();

// CREATE PACKAGE ENQUIRY
router.post("/", async (req, res) => {
  try {
    const { packageId, fullName, email, contactNumber, fromDate, toDate } = req.body;

    if (!packageId || !fullName || !email || !contactNumber || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^[0-9]{10}$/.test(String(contactNumber))) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    const enquiry = await PackageEnquiry.create({
      package: packageId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      contactNumber: contactNumber.trim(),
      fromDate,
      toDate,
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

// GET ALL PACKAGE ENQUIRIES (Admin)
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
      ];
    }

    const totalRecords = await PackageEnquiry.countDocuments(query);

    const enquiries = await PackageEnquiry.find(query)
      .populate("package", "packageName slug")
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
    const enquiry = await PackageEnquiry.findById(req.params.id).populate("package", "packageName slug");

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

// UPDATE ENQUIRY STATUS
router.put("/:id", async (req, res) => {
  try {
    const { status, contactNumber } = req.body;

    if (contactNumber && !/^[0-9]{10}$/.test(String(contactNumber))) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    const updatedEnquiry = await PackageEnquiry.findByIdAndUpdate(
      req.params.id,
      { 
        ...(status !== undefined && { status }),
        ...(contactNumber !== undefined && { contactNumber: contactNumber.trim() })
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
      message: "Enquiry status updated successfully",
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
    const deletedEnquiry = await PackageEnquiry.findByIdAndDelete(req.params.id);

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
