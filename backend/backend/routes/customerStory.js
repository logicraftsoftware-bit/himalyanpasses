import express from 'express';
import CustomerStory from '../models/CustomerStories.js';
import { adminAuth } from './middleware.js';

const router = express.Router();

/* ================= CREATE CUSTOMER STORY ================= */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, youtubeLink, isActive } = req.body;

    if (!title || !description || !youtubeLink) {
      return res.status(400).json({ error: 'Title, description, and YouTube link are required' });
    }

    const customerStoryData = {
      title,
      description,
      youtubeLink,
      isActive: isActive ?? true
    };

    const customerStory = await CustomerStory.create(customerStoryData);

    res.status(201).json(customerStory);
  } catch (error) {
    console.error('CREATE CUSTOMER STORY ERROR:', error);
    res.status(500).json({ error: 'Failed to create customer story' });
  }
});

/* ================= GET ALL ================= */
router.get('/', async (req, res) => {
  try {
    const customerStories = await CustomerStory.find().sort({ createdAt: -1 }).lean();
    res.json(customerStories);
  } catch (err) {
    console.error('FETCH CUSTOMER STORIES ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch customer stories' });
  }
});

/* ================= GET ACTIVE ================= */
router.get('/active', async (req, res) => {
  try {
    const customerStories = await CustomerStory.find({ isActive: true }).lean();
    res.json(customerStories);
  } catch (err) {
    console.error('FETCH ACTIVE CUSTOMER STORIES ERROR:', err);
    res.status(500).json({ error: 'Failed to fetch active customer stories' });
  }
});

/* ================= GET SINGLE ================= */
router.get('/:id', async (req, res) => {
  try {
    const customerStory = await CustomerStory.findById(req.params.id);
    if (!customerStory) {
      return res.status(404).json({ error: 'Customer Story not found' });
    }
    res.json(customerStory);
  } catch (err) {
    console.error('FETCH SINGLE CUSTOMER STORY ERROR:', err);
    res.status(500).json({ error: 'Invalid customer story ID' });
  }
});

/* ================= UPDATE ================= */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.body.youtubeLink !== undefined) {
      updateData.youtubeLink = req.body.youtubeLink;
    }

    const customerStory = await CustomerStory.findById(req.params.id);
    if (!customerStory) {
      return res.status(404).json({ error: 'Customer Story not found' });
    }

    Object.assign(customerStory, updateData);
    await customerStory.save();

    res.json(customerStory);
  } catch (error) {
    console.error('UPDATE ERROR:', error);
    res.status(500).json({ error: 'Failed to update customer story' });
  }
});



/* ================= DELETE ================= */
router.delete('/:id', async (req, res) => {
  try {
    const customerStory = await CustomerStory.findById(req.params.id);

    if (!customerStory) {
      return res.status(404).json({ error: 'Customer Story not found' });
    }


    await customerStory.deleteOne();

    res.json({ message: 'Customer Story deleted successfully' });
  } catch (error) {
    console.error('DELETE CUSTOMER STORY ERROR:', error);
    res.status(500).json({ error: 'Failed to delete customer story' });
  }
});

export default router;