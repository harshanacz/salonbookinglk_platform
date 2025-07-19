import mongoose, { Document } from "mongoose";

export enum Day {
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
  SUN = "SUN",
}

interface ITimeSlot {
  slot_id: string;
  start_time: Date;
  appointmentId: mongoose.Types.ObjectId | null;
  period: number;
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

interface ISalonContext extends Document {
  userId: mongoose.Types.ObjectId;
  numberOfReviewers: number;
  reviewScore: number;
  businessName: string;
  description: string;
  website?: string;
  businessRegistrationNumber?: string;
  isVerified: boolean;
  location: {
    lat: number;
    lng: number;
  };
  phoneNumber: string;
  ownerName: string;
  businessHours: Array<{
    day: Day;
    isOpen: boolean;
    open: string;
    close: string;
  }>;
  profilePictureUrl?: string;
  timeSlots: ITimeSlot[];
  cleanupTimeSlots(): Promise<ISalonContext>;
  updateOverallRating(): Promise<ISalonContext>;
}

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
salonContextSchema.methods.cleanupTimeSlots = function(this: ISalonContext) {
  const now = new Date();
  this.timeSlots = this.timeSlots.filter((slot: ITimeSlot) => {
    const slotDate = new Date(slot.start_time);
    return slotDate >= now;
  });
  return this.save();
};

// Method to update overall salon rating based on all services
salonContextSchema.methods.updateOverallRating = async function(this: ISalonContext) {
  try {
    // Import Service model dynamically to avoid circular dependency
    const Service = mongoose.models.Service || require('./Service').default;
    
    // Get all services for this salon
    const services = await Service.find({ 
      salonContextId: this._id,
      status: 'ACTIVE' // Only include active services
    });

    if (services.length === 0) {
      // No services, reset rating
      this.numberOfReviewers = 0;
      this.reviewScore = 0;
      return this.save();
    }

    // Calculate weighted average rating
    let totalWeightedRating = 0;
    let totalReviewers = 0;

    services.forEach((service: any) => {
      if (service.reviewCount > 0) {
        // Weight each service's rating by its number of reviews
        totalWeightedRating += service.averageRating * service.reviewCount;
        totalReviewers += service.reviewCount;
      }
    });

    if (totalReviewers > 0) {
      // Calculate overall salon rating
      this.reviewScore = parseFloat((totalWeightedRating / totalReviewers).toFixed(2));
      this.numberOfReviewers = totalReviewers;
    } else {
      // No reviews yet
      this.reviewScore = 0;
      this.numberOfReviewers = 0;
    }

    return this.save();
  } catch (error) {
    console.error('Error updating salon overall rating:', error);
    throw error;
  }
};

// Pre-save middleware to automatically clean up old time slots
salonContextSchema.pre('save', function(this: ISalonContext, next) {
  this.cleanupTimeSlots();
  next();
});

export default mongoose.models.SalonContext ||
  mongoose.model<ISalonContext>("SalonContext", salonContextSchema);
