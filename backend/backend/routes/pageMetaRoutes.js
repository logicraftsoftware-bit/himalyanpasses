import express from 'express';
import PageMeta from '../models/PageMeta.js';
import { adminAuth } from './middleware.js';

const router = express.Router();

// Get all page metas
router.get('/', async (req, res) => {
  try {
    const metas = await PageMeta.find().sort({ createdAt: -1 });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get by pageName
router.get('/:pageName', async (req, res) => {
  try {
    const meta = await PageMeta.findOne({ pageName: req.params.pageName });
    if (!meta) return res.status(404).json({ message: 'Not found' });
    res.json(meta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update page meta
router.post('/', adminAuth, async (req, res) => {
  try {
    const { pageName, title, keyword, description } = req.body;
    let meta = await PageMeta.findOne({ pageName });
    
    if (meta) {
      meta.title = title !== undefined ? title : meta.title;
      meta.keyword = keyword !== undefined ? keyword : meta.keyword;
      meta.description = description !== undefined ? description : meta.description;
      await meta.save();
      return res.json({ message: 'Page Meta updated successfully', data: meta });
    }

    meta = new PageMeta({ pageName, title, keyword, description });
    await meta.save();
    res.status(201).json({ message: 'Page Meta created successfully', data: meta });
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await PageMeta.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
