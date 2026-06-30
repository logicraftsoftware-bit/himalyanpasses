import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export default mongoose.models['Announcement'] || mongoose.model('Announcement', announcementSchema);

