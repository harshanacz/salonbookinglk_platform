// Activity logger utility for admin actions
// Uses MongoDB for persistent storage

import AdminActivity, { AdminActionType, IAdminActivity } from '@/models/AdminActivity';
import dbConnect from '@/lib/mongodb';

export interface ActivityLogData {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: AdminActionType;
  target?: string;
  details: string;
  metadata?: Record<string, any>;
}

class AdminActivityLogger {
  // Log an admin activity
  async logActivity(data: ActivityLogData): Promise<void> {
    try {
      await dbConnect();
      
      const activity = new AdminActivity({
        adminId: data.adminId,
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        action: data.action,
        target: data.target || 'system',
        details: data.details,
        metadata: data.metadata,
        timestamp: new Date()
      });

      await activity.save();
      console.log(`[ADMIN_ACTIVITY] ${data.action} logged for ${data.adminName}`);
    } catch (error) {
      console.error('[ADMIN_ACTIVITY_ERROR]', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Get activities with filtering and pagination
  async getActivities(options: {
    adminId?: string;
    action?: AdminActionType;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    try {
      await dbConnect();

      const {
        adminId,
        action,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 50
      } = options;

      // Build query
      const query: any = {};

      if (adminId) query.adminId = adminId;
      if (action) query.action = action;
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = startDate;
        if (endDate) query.timestamp.$lte = endDate;
      }

      if (search) {
        query.$or = [
          { adminName: { $regex: search, $options: 'i' } },
          { adminEmail: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } },
          { target: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count
      const total = await AdminActivity.countDocuments(query);

      // Get paginated results
      const activities = await AdminActivity.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        activities,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[GET_ACTIVITIES_ERROR]', error);
      return {
        activities: [],
        pagination: { total: 0, page: 1, limit: options.limit || 50, pages: 0 }
      };
    }
  }

  // Get activity statistics
  async getActivityStats(days: number = 30) {
    try {
      await dbConnect();
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await AdminActivity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return stats;
    } catch (error) {
      console.error('[GET_ACTIVITY_STATS_ERROR]', error);
      return [];
    }
  }

  // Cleanup old activities (optional - can be run as a cron job)
  async cleanupOldActivities(daysToKeep: number = 365) {
    try {
      await dbConnect();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await AdminActivity.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      console.log(`[CLEANUP] Deleted ${result.deletedCount} old activity logs`);
      return result.deletedCount;
    } catch (error) {
      console.error('[CLEANUP_ERROR]', error);
      return 0;
    }
  }
}

// Export singleton instance
export const activityLogger = new AdminActivityLogger();

// Export helper function for easy use
export const logAdminActivity = (data: ActivityLogData) => {
  // Run async without blocking
  activityLogger.logActivity(data).catch(console.error);
};

export { AdminActionType } from '@/models/AdminActivity';
