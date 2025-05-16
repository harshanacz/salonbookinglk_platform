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
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    emailError: {
      type: String,
    },
    emailRecipientsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Add virtual population for better querying
notificationSchema.virtual("sentByUser", {
  ref: "User",
  localField: "sentBy",
  foreignField: "_id",
  justOne: true,
});

notificationSchema.virtual("selectedSalonUsers", {
  ref: "User",
  localField: "selectedSalons",
  foreignField: "_id",
});

notificationSchema.virtual("selectedClientUsers", {
  ref: "User",
  localField: "selectedClients",
  foreignField: "_id",
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);