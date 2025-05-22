import mongoose, { Schema, Document } from 'mongoose';

// Define the appointment status enum
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

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
const Appointment = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
