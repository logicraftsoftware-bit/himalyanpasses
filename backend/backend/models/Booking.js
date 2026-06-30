import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    
    fullName: {
      type: String,
      required: [true, "Participant full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^\d{10}$/.test(v);
        },
        message: 'Please enter a valid 10-digit mobile number'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package id is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    packageName: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: 'Please enter a valid 10-digit mobile number'
      }
    },

    groupType: {
      type: String,
      enum: ["Private Group", "Fixed Departure", "Custom Group"],
      required: [true, "Group type is required"],
    },

    numberOfPeople: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "At least 1 person is required"],
    },

    fromDate: {
      type: Date,
      required: [true, "From date is required"],
    },

    toDate: {
      type: Date,
      required: [true, "To date is required"],
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    pricePerPerson: {
      type: Number,
      required: true,
      default: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    gstPercent: {
      type: Number,
      default: 5,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    participants: {
      type: [participantSchema],
      validate: {
        validator: function (value) {
          return value.length === this.numberOfPeople;
        },
        message: "Participants count must match numberOfPeople",
      },
    },

    additionals: [
      {
        additionalId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Additional",
        },
        name: String,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models['Booking'] || mongoose.model('Booking', bookingSchema);
