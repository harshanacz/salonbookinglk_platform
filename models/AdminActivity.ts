import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminActivity extends Document {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AdminActionType;
  target: string; // 'system' or specific salon/service/complaint ID
  details: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum AdminActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  NOTIFICATION_SEND = 'NOTIFICATION_SEND',
  SALON_VERIFICATION = 'SALON_VERIFICATION',
  SERVICE_VERIFICATION = 'SERVICE_VERIFICATION',
  ADMIN_SETTINGS_UPDATE = 'ADMIN_SETTINGS_UPDATE',
  COMPLAINT_MANAGEMENT = 'COMPLAINT_MANAGEMENT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SALON_STATUS_TOGGLE = 'SALON_STATUS_TOGGLE',
  SERVICE_STATUS_TOGGLE = 'SERVICE_STATUS_TOGGLE',
  APPOINTMENT_APPROVAL = 'APPOINTMENT_APPROVAL',
  ADMIN_NAME_CHANGE = 'ADMIN_NAME_CHANGE'
}

const AdminActivitySchema = new Schema<IAdminActivity>({
  adminId: {
    type: String,
    required: true,
    index: true
  },
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: Object.values(AdminActionType),
    required: true,
    index: true
  },
  target: {
    type: String,
    required: true,
    default: 'system'
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true,
  collection: 'admin_activities'
});

// Compound indexes for efficient querying
AdminActivitySchema.index({ adminId: 1, timestamp: -1 });
AdminActivitySchema.index({ action: 1, timestamp: -1 });
AdminActivitySchema.index({ timestamp: -1 });

// TTL index to automatically delete old activities after 1 year (optional)
AdminActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

const AdminActivity = mongoose.models.AdminActivity || mongoose.model<IAdminActivity>('AdminActivity', AdminActivitySchema);

export default AdminActivity;
