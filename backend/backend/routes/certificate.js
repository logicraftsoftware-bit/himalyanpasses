import multer from 'multer';
import { promises as fs } from 'fs';
import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Certificate from '../models/certificate.js';
import { adminAuth } from './middleware.js';

const router = express.Router();
import path from 'path';
import { uploadToCloudinary } from '../lib/cloudinary.js';
// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });
/* ================== UPLOAD FILES TO CLOUDINARY (SECURE) ================== */
router.post('/upload', adminAuth, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // allow only images
    const invalidFiles = req.files.filter(
      (file) => !file.mimetype.startsWith('image/')
    );

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        error: 'Only image files are allowed'
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileData = file.buffer;
      const base64String = `data:${file.mimetype};base64,${fileData.toString('base64')}`;

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const cleanName = file.originalname.replace(/\s+/g, '_');

      const publicId = `sliders/${uniqueSuffix}_${cleanName}`;

      return await uploadToCloudinary(base64String, publicId);
    });

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls = uploadResults.map((item) => item.secure_url);
    const publicIds = uploadResults.map((item) => item.public_id);

    const slider = new Certificate({
      imageUrls,
      publicIds,
      active: true
    });

    await slider.save();

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: slider
    });
  } catch (err) {
    console.error('Image upload error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


/* ================== GET ALL SLIDERS ================== */
router.get('/', async (req, res) => {
  try {
    const sliders = await Certificate.find().sort({ createdAt: -1 }).lean();
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== GET IMAGE SLIDERS ================== */
router.get('/images', async (req, res) => {
  try {
    const images = await Certificate.find({ isVideo: false }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* ================== CREATE SLIDER (URL ONLY) ================== */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { imageUrls, publicIds, active } = req.body;

    if (
      !imageUrls ||
      !publicIds ||
      !Array.isArray(imageUrls) ||
      !Array.isArray(publicIds) ||
      imageUrls.length === 0 ||
      publicIds.length === 0
    ) {
      return res.status(400).json({
        error: 'imageUrls and publicIds are required and must be arrays'
      });
    }

    const slider = new Certificate({
      imageUrls,
      publicIds,
      active: active !== false
    });

    await slider.save();

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: slider
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ================== TOGGLE ACTIVE ================== */
router.patch('/:id', async (req, res) => {
  try {
    const slider = await Certificate.findById(req.params.id);
    if (!slider) return res.status(404).json({ error: 'Certificate not found' });

    if (typeof req.body.active === 'boolean') {
      slider.active = req.body.active;
    }

    await slider.save();
    res.json(slider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== DELETE SLIDER ================== */
router.delete('/:id', async (req, res) => {
  try {
    const slider = await Certificate.findById(req.params.id);
    if (!slider) return res.status(404).json({ error: 'Certificate not found' });

    try {
      // Delete all images in the array
      for (const publicId of slider.publicIds) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: slider.isVideo ? 'video' : 'image'
        });
      }
    } catch (err) {
      console.error('Cloudinary delete failed:', err.message);
    }

    await slider.deleteOne();
    res.status(200).json({ message: 'Deleted successfully', _id: slider._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
