import mongoose from "mongoose";

export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  REJECTED = "REJECTED", 
}

export enum ServiceType {
  HAIRCUT = "HAIRCUT",
  COLORING = "COLORING",
  STYLING = "STYLING",
  FACIAL = "FACIAL",
  MASSAGE = "MASSAGE",
  NAILS = "NAILS",
  SKIN_CARE = "SKIN_CARE", 
  OTHER = "OTHER",
}

const serviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.PENDING, // Default to PENDING on creation
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ServiceType),
      required: true,
    },
    description: String,
    images: {
      type: [String], // Array of image URLs from UploadThing
      validate: [arrayLimit, '{PATH} exceeds the limit of 3'], // Limit to 3 images
      default: [],
    },
    price: { // Added price field
      type: Number,
      required: true,
    },
    duration: { // Added duration field (e.g., in minutes)
      type: Number, // Assuming duration is stored in minutes
      required: true,
    },
    staffAssigned: { // Changed staff assigned field to accept string IDs
      type: [String], // Accept string IDs for development
      default: [],
    },
    // Metrics for popularity and rating
    views: {
      type: Number,
      default: 0,
    },
    bookings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // For weighted popularity calculation
    lastBookedAt: {
      type: Date,
      default: null,
    },
    popularityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Validator function for array length
function arrayLimit(val: string[]) {
  return val.length <= 3;
}

// Calculate popularity score before saving
serviceSchema.pre('save', function(next) {
  // Simple popularity algorithm: (views * 0.3) + (bookings * 0.7)
  this.popularityScore = (this.views * 0.3) + (this.bookings * 0.7);
  next();
});

// Clear cached model to ensure schema updates are applied
delete mongoose.models.Service;

export default mongoose.model("Service", serviceSchema);
