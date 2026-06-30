import mongoose from 'mongoose';

const additionalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priceINR: { type: Number, required: true, default: 0 },
  priceUSD: { type: Number, required: true, default: 0 },
  imageUrls: { type: [String], default: [] },
  publicIds: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.models['Additional'] || mongoose.model('Additional', additionalSchema);

