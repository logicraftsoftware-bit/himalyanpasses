import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  imageUrls: [{ type: String, required: true }],
  publicIds: [{ type: String, required: true }],

  active: { type: Boolean, default: true, index: true },

}, { timestamps: true });

export default mongoose.models['Certificate'] || mongoose.model('Certificate', certificateSchema);
