import mongoose from 'mongoose';
import User from './User';
import Service from './Service';
import Appointment from './Appointment';

// Export all models
export {
  User,
  Service,
  Appointment
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
  const requiredModels = ['User', 'Service', 'Appointment'];
  const missingModels = requiredModels.filter(model => !isModelRegistered(model));
  
  if (missingModels.length > 0) {
    console.warn(`Missing models: ${missingModels.join(', ')}`);
  }
  
  return missingModels.length === 0;
};