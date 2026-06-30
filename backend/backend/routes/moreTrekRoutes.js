import express from 'express';
import MoreTrek from '../models/MoreTrek.js';
import Package from '../models/Package.js';

const router = express.Router();

// Get MoreTreks by type (populate packages)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) {
      query.type = type;
    }
    const moreTreks = await MoreTrek.find(query).populate('packages');
    res.status(200).json({ success: true, data: moreTreks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch more treks', error: error.message });
  }
});

// Update or Create MoreTrek for a specific type
router.post('/', async (req, res) => {
  try {
    const { type, packages } = req.body;
    
    if (!type || !Array.isArray(packages)) {
      return res.status(400).json({ success: false, message: 'Type and array of packages are required' });
    }

    const moreTrek = await MoreTrek.findOneAndUpdate(
      { type },
      { type, packages },
      { new: true, upsert: true }
    ).populate('packages');

    res.status(200).json({ success: true, data: moreTrek });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save more treks', error: error.message });
  }
});

export default router;
