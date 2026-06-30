import mongoose from 'mongoose';

const pageMetaSchema = new mongoose.Schema({
  pageName: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  keyword: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models['PageMeta'] || mongoose.model('PageMeta', pageMetaSchema);

