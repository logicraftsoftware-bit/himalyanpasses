import mongoose from 'mongoose';

const departureDateSchema = new mongoose.Schema({
  month: { type: String },
  year:  { type: String, default: '' },
  fromDate: { type: Date },
  toDate: { type: Date },
  maxSeats: { type: Number },
  availabilityText: { type: String, default: 'Available' },
  availabilityTextColor: { type: String, default: 'Green' },
  visible: { type: Boolean, default: true }
});

const itinerarySchema = new mongoose.Schema({
  heading: String,
  subheading: String,
  content: String
});

const faqSchema = new mongoose.Schema({
  heading: String,
  content: String
});


const packageSchema = new mongoose.Schema({
  packageName: { type: String },
  thumbnail: { type: String, default: "" },
  duration: { type: String },

  shortDescription: { type: String },
  region: { type: String },
  bestTime: { type: String },
  highestAltitude: { type: String },
  suitableFor: { type: String },
  trekDistance: { type: String },
  difficulty: { type: String },
  originalPriceINR: { type: Number, default: 0 },
  offerPriceINR: { type: Number, default: 0 },
  originalPriceUSD: { type: Number, default: 0 },
  offerPriceUSD: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  additionals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Additional' }],
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  trekInsuranceAmount: { type: Number, default: 0 },
  travelFee: { type: Number, default: 0 },
  
departureDates: [departureDateSchema],
  overview: { type: String, default: "" },
  itineraries: [itinerarySchema],
  itineraryPdf: { type: String, default: "" }, // PDF url
  faqs: [faqSchema],
  tabs: [String],
  gallery: [{ url: String, tab: String }],
  
  slug: {
  type: String,
  unique: true,
  sparse: true,
  trim: true
},
  seo: {
    title: String,
    description: String,
    keywords: String,
    canonical: String,
  },
  otherOptions: [{ name: String, content: String }]
}, { timestamps: true });

export default mongoose.models['Package'] || mongoose.model('Package', packageSchema);

