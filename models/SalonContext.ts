import mongoose from 'mongoose';

export enum Day {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN'
}

const workingHourSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: Object.values(Day),
    required: true
  },
  isWorking: {
    type: Boolean,
    required: true
  },
  start: {
    type: Number,
    required: true
  },
  end: {
    type: Number,
    required: true
  }
}, { _id: false });

const salonContextSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  numberOfReviewers: {
    type: Number,
    default: 0
  },
  reviewScore: {
    type: Number,
    default: 0
  },
  businessName: {
    type: String,
    required: true
  },
  website: String,
  businessRegistrationNumber: String,
  businessCategory: {
    type: String,
    required: true
  },
  streetAddress: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: String,
  workingHours: {
    type: [workingHourSchema],
    required: true,
    validate: {
      validator: function(hours: any[]) {
        return hours.length === 7; // One entry for each day of the week
      },
      message: 'Working hours must be specified for all 7 days of the week'
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.SalonContext || mongoose.model('SalonContext', salonContextSchema); 