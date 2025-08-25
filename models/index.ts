import mongoose from 'mongoose';
import User from './User';
import Service from './Service';
import Appointment from './Appointment';
import AdminActivity from './AdminActivity';
import Rating from './Rating';
import Staff from './Staff';
import SalonContext from './SalonContext';
import Complaint from './complaint';
import Notifications from './Notifications';

// Export all models
export {
  User,
  Service,
  Appointment,
  AdminActivity,
  Rating,
  Staff,
  SalonContext,
  Complaint,
  Notifications
};

// Helper function to check if a model is registered
export const isModelRegistered = (modelName: string): boolean => {
  return mongoose.models[modelName] !== undefined;
};

// Helper function to get all registered models
export const getRegisteredModels = (): string[] => {
  return Object.keys(mongoose.models);
};

// Optional: Add a function to ensure models are registered
export const ensureModelsRegistered = () => {
  const requiredModels = ['User', 'Service', 'Appointment', 'AdminActivity', 'Staff', 'SalonContext', 'Complaint', 'Rating', 'Notifications'];
  const missingModels = requiredModels.filter(model => !isModelRegistered(model));
  
  if (missingModels.length > 0) {
    console.warn(`Missing models: ${missingModels.join(', ')}`);
  }
  
  return missingModels.length === 0;
};