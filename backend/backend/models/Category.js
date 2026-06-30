import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  heading: String,
  content: String
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  categoryType: { type: String },
  showInHome: { type: Boolean, default: false },
  showInFooter: { type: Boolean, default: false },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String,
  canonical: String,
  faqs: [faqSchema],
  bannerItems: [String],
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  pageContent: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models['Category'] || mongoose.model('Category', categorySchema);

