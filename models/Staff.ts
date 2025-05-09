import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profileImage: String,
    mobileNumber: {
      type: String,
      required: true,
    },
    bio: String,
    role: {
      type: String,
      required: true,
      enum: ['senior-stylist', 'junior-stylist', 'nail-technician', 'beautician', 'massage-therapist'],
    },
    availability: {
      type: String,
      required: true,
      enum: ['full-time', 'part-time', 'weekends-only'],
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
staffSchema.index({ userId: 1 });
staffSchema.index({ email: 1 });

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
