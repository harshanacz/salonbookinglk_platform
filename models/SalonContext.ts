import mongoose from "mongoose";

export enum Day {
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
  SUN = "SUN",
}

const businessHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: Object.values(Day),
      required: true,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    open: {
      type: String,
      required: true,
    },
    close: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const salonContextSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    numberOfReviewers: {
      type: Number,
      default: 0,
    },
    reviewScore: {
      type: Number,
      default: 0,
    },
    businessName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    website: String,
    businessRegistrationNumber: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    businessHours: {
      type: [businessHourSchema],
      required: true,
      validate: {
        validator: function (hours: any[]) {
          return hours.length === 7;
        },
        message: "Business hours must be specified for all 7 days of the week",
      },
    },
    profilePictureUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SalonContext ||
  mongoose.model("SalonContext", salonContextSchema);
