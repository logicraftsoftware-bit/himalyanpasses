import mongoose from 'mongoose';

const blogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.models['BlogCategory'] || mongoose.model('BlogCategory', blogCategorySchema);

