import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^\d{10}$/.test(v);
        },
        message: 'Please enter a valid 10-digit mobile number'
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
    photo: {
      type: String,
      default: "",
    },
     location: {
      type: String,
      default: "",
    },
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordOTPExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models['User'] || mongoose.model('User', userSchema);

