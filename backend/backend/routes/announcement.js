import express from 'express';
import Announcement from '../models/announcement.js';
import { adminAuth } from './middleware.js';

const router = express.Router();

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE announcement
router.post('/', adminAuth, async (req, res) => {
  try {
    const { heading, description, active } = req.body;
    if (!heading || !description) {
      return res.status(400).json({ error: 'Heading and description are required' });
    }

    const announcement = new Announcement({
      heading,
      description,
      active: active !== false
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE announcement
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

    if (req.body.heading !== undefined) announcement.heading = req.body.heading;
    if (req.body.description !== undefined) announcement.description = req.body.description;
    if (req.body.active !== undefined) announcement.active = req.body.active;

    await announcement.save();
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE announcement
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

    await announcement.deleteOne();
    res.status(200).json({ message: 'Deleted successfully', _id: announcement._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle active
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

    if (typeof req.body.active === 'boolean') {
      announcement.active = req.body.active;
    }

    await announcement.save();
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
