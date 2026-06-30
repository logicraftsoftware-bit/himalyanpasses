import mongoose from 'mongoose';

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['terms', 'privacy', 'refund'],
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.models['Policy'] || mongoose.model('Policy', policySchema);
