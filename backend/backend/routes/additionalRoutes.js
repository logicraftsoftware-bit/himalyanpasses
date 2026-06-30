import express from 'express';
import Additional from '../models/Additional.js';
import { adminAuth } from './middleware.js';
import multer from 'multer';
import cloudinary, { uploadToCloudinary } from '../lib/cloudinary.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ================== GET ALL ================== */
router.get('/', async (req, res) => {
  try {
    const additionals = await Additional.find().sort({ createdAt: -1 });
    res.json(additionals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== CREATE ================== */
router.post('/', adminAuth, upload.array('images'), async (req, res) => {
  try {
    const { name, priceINR, priceUSD } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    let imageUrls = [];
    let publicIds = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileData = file.buffer;
        const base64String = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const publicId = `additionals/${uniqueSuffix}_${file.originalname.replace(/\s+/g, '_')}`;
        return await uploadToCloudinary(base64String, publicId);
      });

      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map(r => r.secure_url);
      publicIds = uploadResults.map(r => r.public_id);
    }

    const additional = new Additional({
      name,
      priceINR: Number(priceINR) || 0,
      priceUSD: Number(priceUSD) || 0,
      imageUrls,
      publicIds
    });

    await additional.save();
    res.status(201).json(additional);
  } catch (err) {
    console.error('Create additional error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ================== UPDATE ================== */
router.put('/:id', adminAuth, upload.array('images'), async (req, res) => {
  try {
    const { name, priceINR, priceUSD } = req.body;
    const additional = await Additional.findById(req.params.id);
    
    if (!additional) return res.status(404).json({ error: 'Additional not found' });

    if (name !== undefined) additional.name = name;
    if (priceINR !== undefined) additional.priceINR = Number(priceINR) || 0;
    if (priceUSD !== undefined) additional.priceUSD = Number(priceUSD) || 0;

    let parsedExistingImages = [];
    let parsedExistingPublicIds = [];
    if (req.body.existingImages) {
        try {
            parsedExistingImages = JSON.parse(req.body.existingImages);
            parsedExistingPublicIds = JSON.parse(req.body.existingPublicIds);
        } catch(e) {
            console.error("Error parsing existing images:", e);
        }
    }

    // Find images to delete
    const imagesToDelete = additional.publicIds.filter(id => !parsedExistingPublicIds.includes(id));

    // Delete removed images
    for (const publicId of imagesToDelete) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Delete old image error:', err);
        }
    }

    const newPublicIds = [...parsedExistingPublicIds];
    const newImageUrls = [...parsedExistingImages];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileData = file.buffer;
        const base64String = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const publicId = `additionals/${uniqueSuffix}_${file.originalname.replace(/\s+/g, '_')}`;
        return await uploadToCloudinary(base64String, publicId);
      });

      const uploadResults = await Promise.all(uploadPromises);
      uploadResults.forEach(r => {
        newImageUrls.push(r.secure_url);
        newPublicIds.push(r.public_id);
      });
    }

    additional.imageUrls = newImageUrls;
    additional.publicIds = newPublicIds;

    await additional.save();
    res.json(additional);
  } catch (err) {
    console.error('Update additional error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ================== DELETE ================== */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const additional = await Additional.findByIdAndDelete(req.params.id);
    if (!additional) return res.status(404).json({ error: 'Additional not found' });

    for (const publicId of additional.publicIds || []) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error('Cloudinary delete error:', err);
      }
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
