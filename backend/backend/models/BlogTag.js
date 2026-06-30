import mongoose from 'mongoose';

const blogTagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.models['BlogTag'] || mongoose.model('BlogTag', blogTagSchema);

