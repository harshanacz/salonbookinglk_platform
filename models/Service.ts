import mongoose from "mongoose";

export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING", // Added PENDING status
}

export enum ServiceType {
  HAIRCUT = "HAIRCUT",
  COLORING = "COLORING",
  STYLING = "STYLING",
  FACIAL = "FACIAL",
  MASSAGE = "MASSAGE",
  NAILS = "NAILS",
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
    // Add any other fields collected from the form steps
  },
  {
    timestamps: true,
  }
);

// Validator function for array length
function arrayLimit(val: string[]) {
  return val.length <= 3;
}

// Clear cached model to ensure schema updates are applied
delete mongoose.models.Service;

export default mongoose.model("Service", serviceSchema);
