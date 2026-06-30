import mongoose from "mongoose";

const moreTrekSchema = new mongoose.Schema({
  type: {
    type: String, // e.g., 'Trending Trekking', 'Upcoming'
    required: true,
    unique: true,
  },
  packages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  }],
}, { timestamps: true });

export default mongoose.models['MoreTrek'] || mongoose.model('MoreTrek', moreTrekSchema);

