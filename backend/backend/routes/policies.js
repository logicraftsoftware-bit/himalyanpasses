import express from 'express';
import Policy from '../models/Policy.js';
import { adminAuth } from './middleware.js';

const router = express.Router();

const allowedTypes = ['terms', 'privacy', 'refund'];

const defaultTitles = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy'
};

/* ================= GET ALL POLICIES ================= */
router.get('/', async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 }).lean();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= GET SINGLE POLICY BY TYPE ================= */
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid policy type' });
    }

    let policy = await Policy.findOne({ type }).lean();

    if (!policy) {
      policy = await Policy.create({
        type,
        title: defaultTitles[type],
        content: '',
        isActive: true
      });
    }

    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= CREATE OR UPDATE POLICY ================= */
router.put('/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { title, content, isActive } = req.body;

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid policy type' });
    }

    const updateData = {};

    if (title !== undefined) {
      updateData.title = title;
    } else {
      updateData.title = defaultTitles[type];
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const policy = await Policy.findOneAndUpdate(
      { type },
      { $set: updateData, $setOnInsert: { type } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(policy);
  } catch (err) {
    console.error('UPDATE POLICY ERROR:', err);
    res.status(500).json({ error: err.message || 'Failed to update policy' });
  }
});

/* ================= DELETE POLICY ================= */
router.delete('/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid policy type' });
    }

    const policy = await Policy.findOne({ type });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    await policy.deleteOne();

    res.json({ message: `${type} policy deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;