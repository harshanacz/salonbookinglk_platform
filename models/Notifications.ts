import mongoose from "mongoose";

export enum NotificationRecipientType {
  SALONS = "salons",
  CLIENTS = "clients",
  ALL = "all",
}

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    recipientType: {
      type: String,
      enum: Object.values(NotificationRecipientType),
      required: true,
    },
    allSalons: {
      type: Boolean,
      default: false,
    },
    allClients: {
      type: Boolean,
      default: false, 
    },
    onlyVerifiedSalons: {
      type: Boolean,
      default: false, 
    },
    selectedSalons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    ], 
    selectedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
    ],
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    }
  },
  {
    timestamps: true, 
  }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);