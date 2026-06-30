import express from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { authenticateToken } from "./middleware.js";

const router = express.Router();

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^[0-9]{10}$/.test(String(phone));
};

/* ================= CREATE BOOKING ================= */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      packageId,
      packageName,
      fullName,
      email,
      contactNumber,
      groupType,
      numberOfPeople,
      fromDate,
      toDate,
      address,
      pricePerPerson,
      gstPercent,
      participants,
      additionals,
    } = req.body;

    if (!packageId || !mongoose.Types.ObjectId.isValid(packageId)) {
      return res.status(400).json({
        success: false,
        message: "Valid packageId is required",
      });
    }

    if (!packageName || !fullName || !email || !contactNumber || !groupType || !numberOfPeople || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (!isValidPhone(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Participants data is required",
      });
    }

    if (Number(numberOfPeople) !== participants.length) {
      return res.status(400).json({
        success: false,
        message: "Number of people must match participants count",
      });
    }

    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];

      if (!p.fullName) {
        return res.status(400).json({
          success: false,
          message: `Participant ${i + 1}: fullName is required`,
        });
      }

      if (p.email && !isValidEmail(p.email)) {
        return res.status(400).json({
          success: false,
          message: `Participant ${i + 1}: invalid email`,
        });
      }

      if (p.phone && !isValidPhone(p.phone)) {
        return res.status(400).json({
          success: false,
          message: `Participant ${i + 1}: phone must be 10 digits`,
        });
      }
    }

    const perPerson = Number(pricePerPerson) || 0;
    const participantsSubtotal = perPerson * Number(numberOfPeople);
    
    const additionalsTotal = Array.isArray(additionals) 
      ? additionals.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      : 0;

    const subtotal = participantsSubtotal + additionalsTotal;
    const gst = Number(gstPercent ?? 5);
    const gstAmount = (subtotal * gst) / 100;
    const totalAmount = subtotal + gstAmount;

    const booking = await Booking.create({
      userId: req.user.id,
      packageId,
      packageName: packageName.trim(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      contactNumber: String(contactNumber).trim(),
      groupType,
      numberOfPeople: Number(numberOfPeople),
      fromDate,
      toDate,
      address: address?.trim() || "",
      pricePerPerson: perPerson,
      subtotal,
      gstPercent: gst,
      gstAmount,
      totalAmount,
      participants,
      additionals: additionals || [],
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
});

/* ================= GET BOOKINGS BY USER ================= */
router.get("/my-bookings", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

/* ================= GET ALL BOOKINGS ================= */
router.get("/",  async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const bookingStatus = req.query.bookingStatus || "";
    const paymentStatus = req.query.paymentStatus || "";

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contactNumber: { $regex: search, $options: "i" } },
        { packageName: { $regex: search, $options: "i" } },
      ];
    }

    if (bookingStatus) query.bookingStatus = bookingStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const totalRecords = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});

/* ================= GET SINGLE BOOKING ================= */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
});

/* ================= UPDATE BOOKING ================= */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const {
      fullName,
      email,
      contactNumber,
      groupType,
      numberOfPeople,
      fromDate,
      toDate,
      address,
      pricePerPerson,
      gstPercent,
      bookingStatus,
      paymentStatus,
      participants,
      additionals,
    } = req.body;

    const existingBooking = await Booking.findById(req.params.id);

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    if (contactNumber && !isValidPhone(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    const finalNumberOfPeople = numberOfPeople !== undefined
      ? Number(numberOfPeople)
      : existingBooking.numberOfPeople;

    const finalParticipants = participants !== undefined
      ? participants
      : existingBooking.participants;

    if (!Array.isArray(finalParticipants) || finalParticipants.length !== finalNumberOfPeople) {
      return res.status(400).json({
        success: false,
        message: "Participants count must match numberOfPeople",
      });
    }

    for (let i = 0; i < finalParticipants.length; i++) {
      const p = finalParticipants[i];

      if (!p.fullName) {
        return res.status(400).json({
          success: false,
          message: `Participant ${i + 1}: fullName is required`,
        });
      }

      if (p.email && !isValidEmail(p.email)) {
        return res.status(400).json({
          success: false,
          message: `Participant ${i + 1}: invalid email`,
        });
      }

      if (p.phone && !isValidPhone(p.phone)) {
        return res.status(400).json({
          success: false,
          message: `Participant ${i + 1}: phone must be 10 digits`,
        });
      }
    }

    const perPerson = pricePerPerson !== undefined
      ? Number(pricePerPerson)
      : existingBooking.pricePerPerson;

    const gst = gstPercent !== undefined
      ? Number(gstPercent)
      : existingBooking.gstPercent;

    const finalAdditionals = additionals !== undefined
      ? additionals
      : existingBooking.additionals;

    const participantsSubtotal = perPerson * finalNumberOfPeople;
    
    const additionalsTotal = Array.isArray(finalAdditionals)
      ? finalAdditionals.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      : 0;

    const subtotal = participantsSubtotal + additionalsTotal;
    const gstAmount = (subtotal * gst) / 100;
    const totalAmount = subtotal + gstAmount;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        ...(fullName !== undefined && { fullName: fullName.trim() }),
        ...(email !== undefined && { email: email.trim().toLowerCase() }),
        ...(contactNumber !== undefined && { contactNumber: String(contactNumber).trim() }),
        ...(groupType !== undefined && { groupType }),
        ...(numberOfPeople !== undefined && { numberOfPeople: finalNumberOfPeople }),
        ...(fromDate !== undefined && { fromDate }),
        ...(toDate !== undefined && { toDate }),
        ...(address !== undefined && { address: address.trim() }),
        ...(pricePerPerson !== undefined && { pricePerPerson: perPerson }),
        ...(gstPercent !== undefined && { gstPercent: gst }),
        ...(bookingStatus !== undefined && { bookingStatus }),
        ...(paymentStatus !== undefined && { paymentStatus }),
        ...(participants !== undefined && { participants: finalParticipants }),
        ...(additionals !== undefined && { additionals: finalAdditionals }),
        subtotal,
        gstAmount,
        totalAmount,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
});

/* ================= DELETE BOOKING ================= */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
});

export default router;