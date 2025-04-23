import mongoose from "mongoose";

export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
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
      default: ServiceStatus.ACTIVE,
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
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service ||
  mongoose.model("Service", serviceSchema);
