import multer from 'multer';
import { promises as fs } from 'fs';
import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Slider from '../models/slider.js';
import { adminAuth } from './middleware.js';

const router = express.Router();
import path from 'path';
import { uploadToCloudinary } from '../lib/cloudinary.js';
// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });
/* ================== UPLOAD FILES TO CLOUDINARY (SECURE) ================== */
router.post('/upload', adminAuth, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const isVideo = req.body.isVideo === 'true' || req.body.isVideo === true;
    
    // Upload files in parallel for better performance
    const uploadPromises = req.files.map(async (file) => {
      const fileData = file.buffer;
      const base64String = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
      
      // Generate unique public ID
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const publicId = `sliders/${uniqueSuffix}_${file.originalname.replace(/\s+/g, '_')}`;
      
      return await uploadToCloudinary(base64String, publicId);
    });

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(r => r.secure_url);
    const publicIds = uploadResults.map(r => r.public_id);

    // Create ONE slider entry for the entire batch
    const slider = new Slider({
      imageUrls,
      publicIds,
      heading: req.body.heading,
      subType: req.body.subType,
      link: req.body.link,
      isVideo: isVideo,
      active: true
    });
    await slider.save();

    // Return the single slider document
    res.status(201).json(slider);
  } catch (err) {
    console.error('Batch upload error:', err);
    res.status(500).json({ error: err.message });
  }
});


/* ================== GET ALL SLIDERS ================== */
router.get('/', async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== GET IMAGE SLIDERS ================== */
router.get('/images', async (req, res) => {
  try {
    const images = await Slider.find({ isVideo: false }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== GET VIDEO SLIDERS ================== */
router.get('/videos', async (req, res) => {
  try {
    const videos = await Slider.find({ isVideo: true }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== CREATE SLIDER (URL ONLY) ================== */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { imageUrls, publicIds, isVideo, active, heading, subType, link } = req.body;

    if (!imageUrls || !publicIds || !Array.isArray(imageUrls)) {
      return res.status(400).json({ error: 'imageUrls and publicIds required' });
    }

    const slider = new Slider({
      imageUrls,
      publicIds,
      heading,
      subType,
      link,
      isVideo: Boolean(isVideo),
      active: active !== false
    });

    await slider.save();
    res.status(201).json(slider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== UPDATE SLIDER (WITH IMAGES) ================== */
router.put('/:id', adminAuth, upload.array('files'), async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return res.status(404).json({ error: 'Slider not found' });

    if (req.body.heading !== undefined) slider.heading = req.body.heading;
    if (req.body.subType !== undefined) slider.subType = req.body.subType;
    if (req.body.link !== undefined) slider.link = req.body.link;

    if (req.files && req.files.length > 0) {
      // 1. Delete old images
      for (const publicId of slider.publicIds) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: slider.isVideo ? 'video' : 'image'
        });
      }

      // 2. Upload new images
      const uploadPromises = req.files.map(async (file) => {
        const fileData = file.buffer;
        const base64String = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const publicId = `sliders/${uniqueSuffix}_${file.originalname.replace(/\s+/g, '_')}`;
        return await uploadToCloudinary(base64String, publicId);
      });

      const uploadResults = await Promise.all(uploadPromises);
      slider.imageUrls = uploadResults.map(r => r.secure_url);
      slider.publicIds = uploadResults.map(r => r.public_id);
    }

    await slider.save();
    res.json(slider);
  } catch (err) {
    console.error('Update slider error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ================== TOGGLE ACTIVE ================== */
router.patch('/:id', async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return res.status(404).json({ error: 'Slider not found' });

    if (typeof req.body.active === 'boolean') {
      slider.active = req.body.active;
    }
    if (req.body.heading !== undefined) slider.heading = req.body.heading;
    if (req.body.subType !== undefined) slider.subType = req.body.subType;
    if (req.body.link !== undefined) slider.link = req.body.link;

    await slider.save();
    res.json(slider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== DELETE SLIDER ================== */
router.delete('/:id', async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return res.status(404).json({ error: 'Slider not found' });

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
