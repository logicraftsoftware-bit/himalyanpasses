import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory' }],
  content: { type: String, required: true },
  thumbnail: {
    url: { type: String },
    publicId: { type: String }
  },
  image1: {
    url: { type: String },
    publicId: { type: String }
  },
  image2: {
    url: { type: String },
    publicId: { type: String }
  },
  image3: {
    url: { type: String },
    publicId: { type: String }
  },
  active: { type: Boolean, default: true },
  slug: { type: String, required: true, unique: true },
  tags: [{ type: String }],
  publishDate: { type: Date, default: Date.now },
  metaTitle: { type: String },
  metaKeywords: { type: String },
  metaDescription: { type: String }
}, { timestamps: true });

export default mongoose.models['Blog'] || mongoose.model('Blog', blogSchema);

