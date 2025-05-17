import mongoose from "mongoose";

export enum UserType {
  CUSTOMER = "CUSTOMER",
  SALON_OWNER = "SALON_OWNER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

const userSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
    mobileNumber: {
      type: String,
      required: false,
    },
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allows multiple null/undefined values
    },
    gender: {
      type: String,
      enum: [...Object.values(Gender), null],
      required: false,
      default: null,
    },
    country: {
      type: String,
      required: false,
    },
    profileImage: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
