import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  platform: String,
  url: String,
  iconUrl: String,
  iconPublicId: String,
});

const settingSchema = new mongoose.Schema({
  contactNumber: { 
    type: String, 
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  whatsappNumber: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid 10-digit mobile number'
    }
  },
  emailId: { 
    type: String, 
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  address: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  mapIframe: { type: String, default: '' },
  socialLinks: { type: [socialLinkSchema], default: [] },
}, { timestamps: true });
settingSchema.index({ createdAt: -1 });

export default mongoose.models['Setting'] || mongoose.model('Setting', settingSchema);

