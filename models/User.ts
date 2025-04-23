import mongoose from 'mongoose';

export enum UserType {
  USER = 'USER',
  SALON_OWNER = 'SALON_OWNER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

const userSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(UserType),
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: true
  },
  country: {
    type: String,
    required: true
  },
  profileImage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema); 