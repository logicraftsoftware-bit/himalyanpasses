import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
  imageUrls: [{ type: String, required: true }],
  publicIds: [{ type: String, required: true }],
  heading: { type: String },
  subType: { type: String },
  active: { type: Boolean, default: true, index: true },
  isVideo: { type: Boolean, default: false },
  link: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.models['Slider'] || mongoose.model('Slider', sliderSchema);
