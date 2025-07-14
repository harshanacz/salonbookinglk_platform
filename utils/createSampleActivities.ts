// Demo script to create sample admin activities for testing
// This should be run manually in development

import { activityLogger, AdminActionType } from '@/lib/adminActivityLogger';

export const createSampleActivities = async () => {
  const sampleActivities = [
    {
      adminId: "sample-admin-1",
      adminName: "John Admin",
      adminEmail: "john@admin.com",
      action: AdminActionType.LOGIN,
      target: "system",
      details: "Admin logged in to the system",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      metadata: {
        loginTime: new Date().toISOString(),
        userType: "ADMIN"
      }
    },
    {
      adminId: "sample-admin-1",
      adminName: "John Admin",
      adminEmail: "john@admin.com",
      action: AdminActionType.SALON_VERIFICATION,
      target: "salon-123",
      details: "Approved salon 'Beauty Studio' for operation",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      metadata: {
        salonId: "salon-123",
        salonName: "Beauty Studio",
        action: "approved"
      }
    },
    {
      adminId: "sample-admin-1",
      adminName: "John Admin",
      adminEmail: "john@admin.com",
      action: AdminActionType.NOTIFICATION_SEND,
      target: "system",
      details: "Sent notification 'System Maintenance' to all users",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      metadata: {
        notificationTitle: "System Maintenance",
        recipientType: "all",
        recipientCount: "all users"
      }
    },
    {
      adminId: "sample-admin-2",
      adminName: "Jane SuperAdmin",
      adminEmail: "jane@superadmin.com",
      action: AdminActionType.SERVICE_VERIFICATION,
      target: "service-456",
      details: "Rejected service 'Hair Styling' (ID: service-456)",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      metadata: {
        serviceId: "service-456",
        serviceName: "Hair Styling",
        action: "rejected",
        previousStatus: "PENDING",
        newStatus: "REJECTED"
      }
    },
    {
      adminId: "sample-admin-2",
      adminName: "Jane SuperAdmin",
      adminEmail: "jane@superadmin.com",
      action: AdminActionType.ADMIN_SETTINGS_UPDATE,
      target: "system",
      details: "Updated admin profile name to 'Jane SuperAdmin'",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      metadata: {
        previousName: "Jane Admin",
        newName: "Jane SuperAdmin",
        updateField: "fullName"
      }
    }
  ];

  try {
    for (const activity of sampleActivities) {
      await activityLogger.logActivity(activity);
      // Add delay to create different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Sample activities created successfully!');
    return { success: true, count: sampleActivities.length };
  } catch (error) {
    console.error('Error creating sample activities:', error);
    return { success: false, error };
  }
};
