import mongoose, { Schema, Document } from 'mongoose';
import { AppointmentStatus, PaymentMethod } from './enums';

// Re-export the enums to maintain backward compatibility
export { AppointmentStatus, PaymentMethod };

// Interface to define the appointment document structure
export interface IAppointment extends Document {
  clientId: mongoose.Types.ObjectId;
  salonId?: mongoose.Types.ObjectId;
  salonContextId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  staffId?: mongoose.Types.ObjectId;
  date: Date;
  time: number; // Time in minutes from midnight
  paymentMethod?: string;
  note?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Define the appointment schema
const appointmentSchema = new Schema<IAppointment>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    salonId: { type: Schema.Types.ObjectId, ref: 'User' },
    salonContextId: { type: Schema.Types.ObjectId, ref: 'SalonContext' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    date: { type: Date, required: true },
    time: { type: Number, required: true }, // Time in minutes from midnight
    paymentMethod: { type: String },
    note: { type: String },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Create and export the model
let Appointment: mongoose.Model<IAppointment>;

// Check if we're in a browser environment where mongoose.models might not be fully initialized
try {
  // This will only run on the server side or where mongoose is properly initialized
  Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);
} catch (error) {
  // Fallback for client-side rendering
  console.warn("Using fallback Appointment model for client rendering");
  Appointment = mongoose.models.Appointment as mongoose.Model<IAppointment>; // On client this might be undefined
}

export default Appointment;
