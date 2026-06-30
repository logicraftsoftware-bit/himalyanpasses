import express from 'express';
import FAQ from '../models/FAQ.js';
import { adminAuth } from './middleware.js';

const router = express.Router();

/* ================== GET ALL FAQs ================== */
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 }).lean();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== CREATE FAQ ================== */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { question, answer, isActive } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const faq = new FAQ({
      question,
      answer,
      isActive: isActive !== false
    });

    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== UPDATE FAQ ================== */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { question, answer, isActive } = req.body;
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (isActive !== undefined) faq.isActive = Boolean(isActive);

    await faq.save();
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================== DELETE FAQ ================== */
router.delete('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
