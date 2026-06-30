import mongoose from 'mongoose';

const aboutUsSectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  pageName: { type: String },
  content: { type: String, required: true },
  image: {
    url: { type: String },
    publicId: { type: String }
  },
  slug: { type: String, required: true, unique: true },
  metaTitle: { type: String },
  metaKeywords: { type: String },
  metaDescription: { type: String }
}, { timestamps: true });

export default mongoose.models['AboutUsSection'] || mongoose.model('AboutUsSection', aboutUsSectionSchema);

