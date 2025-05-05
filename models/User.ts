import mongoose, { Schema } from "mongoose";

export enum UserType {
  CUSTOMER = "CUSTOMER",
  SALON_OWNER = "SALON_OWNER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

// Ensure UserType values are available as an array
const userTypeValues = Object.values(UserType);

const UserSchema = new Schema(
  {
    type: {
      type: String,
      enum: {
        values: userTypeValues,
        message: "{VALUE} is not a valid user type",
      },
      required: [true, "User type is required"],
    },
    clerkUserId: {
      type: String,
      required: [true, "Clerk user ID is required"],
      unique: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: false,
      trim: true,
    },
    gender: {
      type: String,
      // Simplify the enum definition to fix the validation issue
      enum: ["Male", "Female", "Prefer not to say"],
      default: "Prefer not to say",
    },
    country: {
      type: String,
      default: "Sri Lanka",
      trim: true,
    },
    address: {
      type: String,
      required: false,
      trim: true,
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

// Add this to clear the model from the cache before compiling it
// This helps prevent errors when hot-reloading during development
mongoose.models = {};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
