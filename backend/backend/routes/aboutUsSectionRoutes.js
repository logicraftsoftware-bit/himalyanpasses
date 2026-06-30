import express from 'express';
import multer from 'multer';
import AboutUsSection from '../models/AboutUsSection.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';
import cloudinary from '../lib/cloudinary.js';
import { adminAuth } from './middleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 }
});

// GET all sections
router.get('/', async (req, res) => {
  try {
    const sections = await AboutUsSection.find().sort({ createdAt: -1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single section by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const section = await AboutUsSection.findOne({ slug: req.params.slug });
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single section by ID
router.get('/:id', async (req, res) => {
  try {
    const section = await AboutUsSection.findById(req.params.id);
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new section
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { heading, pageName, content, slug, metaTitle, metaKeywords, metaDescription } = req.body;
    
    let imageData = { url: '', publicId: '' };
    if (req.file) {
      const fileData = req.file.buffer;
      const base64String = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const publicId = `about_us_sections/${uniqueSuffix}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const result = await uploadToCloudinary(base64String, publicId);
      imageData = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    const newSection = new AboutUsSection({
      heading,
      pageName,
      content,
      slug,
      metaTitle,
      metaKeywords,
      metaDescription,
      image: imageData
    });

    await newSection.save();
    res.status(201).json(newSection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update section
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const section = await AboutUsSection.findById(req.params.id);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    const { heading, pageName, content, slug, metaTitle, metaKeywords, metaDescription } = req.body;
    
    if (heading) section.heading = heading;
    if (pageName !== undefined) section.pageName = pageName;
    if (content) section.content = content;
    if (slug) section.slug = slug;
    if (metaTitle !== undefined) section.metaTitle = metaTitle;
    if (metaKeywords !== undefined) section.metaKeywords = metaKeywords;
    if (metaDescription !== undefined) section.metaDescription = metaDescription;

    if (req.file) {
      // Delete old image if exists
      if (section.image && section.image.publicId) {
        try {
          await cloudinary.uploader.destroy(section.image.publicId);
        } catch (e) {}
      }

      const fileData = req.file.buffer;
      const base64String = `data:${req.file.mimetype};base64,${fileData.toString('base64')}`;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const publicId = `about_us_sections/${uniqueSuffix}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const result = await uploadToCloudinary(base64String, publicId);
      section.image = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    await section.save();
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE section
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const section = await AboutUsSection.findById(req.params.id);
    if (!section) return res.status(404).json({ error: 'Section not found' });

    if (section.image && section.image.publicId) {
      try {
        await cloudinary.uploader.destroy(section.image.publicId);
      } catch (e) {}
    }

    await AboutUsSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
