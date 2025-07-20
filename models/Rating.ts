import mongoose, { Schema, Document } from 'mongoose';

// Interface to define the rating document structure
export interface IRating extends Document {
  userId: mongoose.Types.ObjectId;
  appointmentId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  salonId?: mongoose.Types.ObjectId; // Make optional
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the rating schema
const ratingSchema = new Schema<IRating>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    appointmentId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Appointment', 
      required: true 
    },
    serviceId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Service', 
      required: true 
    },
    salonId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: false // Make optional since original request didn't include it
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    comment: { 
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true,
  }
);

// Create compound index to prevent duplicate ratings for same user-appointment-service combination
ratingSchema.index({ userId: 1, appointmentId: 1, serviceId: 1 }, { unique: true });

// Clear cached model to ensure schema updates are applied
delete mongoose.models.Rating;

export default mongoose.model<IRating>("Rating", ratingSchema);
