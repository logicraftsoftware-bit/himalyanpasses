import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

export default mongoose.models['FAQ'] || mongoose.model('FAQ', faqSchema);

