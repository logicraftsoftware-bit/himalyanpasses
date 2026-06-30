import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema({
  iconUrl: { type: String, default: '' },
  iconPublicId: { type: String, default: '' },
  subheading: { type: String, default: '' },
  text: { type: String, default: '' }
});

const missionVisionSchema = new mongoose.Schema({
  iconUrl: { type: String, default: '' },
  iconPublicId: { type: String, default: '' },
  heading: { type: String, default: '' },
  text: { type: String, default: '' }
});

const aboutUsSchema = new mongoose.Schema({
  heading: { type: String, default: 'About Us' },
  pageName: { type: String, default: 'About Us' },
  content: { type: String, default: '' },
  images: [{
    url: String,
    publicId: String
  }],
  highlights: { type: [highlightSchema], default: [] },
  missionVision: { type: [missionVisionSchema], default: [] },
  slug: { type: String, default: 'about-us' },
  metaTitle: { type: String, default: '' },
  metaKeywords: { type: String, default: '' },
  metaDescription: { type: String, default: '' }
}, { timestamps: true });
aboutUsSchema.index({ createdAt: -1 });

export default mongoose.models['AboutUs'] || mongoose.model('AboutUs', aboutUsSchema);

