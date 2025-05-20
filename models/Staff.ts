import mongoose, { Document } from "mongoose";

interface ITimeSlot {
  slot_id: string;
  start_time: Date;
  appointmentId: mongoose.Types.ObjectId | null;
  period: number;
}

interface IStaff extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  profileImage?: string;
  mobileNumber: string;
  bio?: string;
  role: 'senior-stylist' | 'junior-stylist' | 'nail-technician' | 'beautician' | 'massage-therapist';
  availability: 'full-time' | 'part-time' | 'weekends-only';
  workingDays: string[];
  status: 'Active' | 'Inactive';
  timeSlots: ITimeSlot[];
  cleanupTimeSlots(): Promise<IStaff>;
}

const timeSlotSchema = new mongoose.Schema(
  {
    slot_id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    start_time: {
      type: Date,
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    period: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

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
    timeSlots: {
      type: [timeSlotSchema],
      default: [], 
    },
  },
  {
    timestamps: true,
  }
);

// Method to clean up old time slots
staffSchema.methods.cleanupTimeSlots = function(this: IStaff) {
  const now = new Date();
  this.timeSlots = this.timeSlots.filter((slot: ITimeSlot) => {
    const slotDate = new Date(slot.start_time);
    return slotDate >= now;
  });
  return this.save();
};

// Pre-save middleware to automatically clean up old time slots
staffSchema.pre('save', function(this: IStaff, next) {
  this.cleanupTimeSlots();
  next();
});

// Add indexes for better query performance
staffSchema.index({ userId: 1 });
staffSchema.index({ email: 1 });

export default mongoose.models.Staff || mongoose.model<IStaff>("Staff", staffSchema);
