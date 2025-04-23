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
    profileImage: String,
    mobileNumber: {
      type: String,
      required: true,
    },
    bio: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
