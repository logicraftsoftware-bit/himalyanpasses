import express from 'express';
import BlogTag from '../models/BlogTag.js';
import { adminAuth } from './middleware.js';

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await BlogTag.find().sort({ createdAt: -1 });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a tag
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    // Format the tag name to be clean (lowercase, trim spaces)
    const cleanName = name.trim().toLowerCase();
    
    // Check if exists
    let tag = await BlogTag.findOne({ name: cleanName });
    if (tag) {
        return res.status(400).json({ error: 'Tag already exists' });
    }

    tag = new BlogTag({ name: cleanName });
    await tag.save();
    res.status(201).json(tag);
  } catch (err) {
    if (err.code === 11000) {
        res.status(400).json({ error: 'Tag already exists' });
    } else {
        res.status(500).json({ error: err.message });
    }
  }
});

// Update a tag
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const cleanName = name.trim().toLowerCase();
    
    const tag = await BlogTag.findByIdAndUpdate(
      req.params.id,
      { name: cleanName },
      { new: true }
    );
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    res.json(tag);
  } catch (err) {
    if (err.code === 11000) {
        res.status(400).json({ error: 'Tag already exists' });
    } else {
        res.status(500).json({ error: err.message });
    }
  }
});

// Delete a tag
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const tag = await BlogTag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    res.json({ message: 'Tag deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
