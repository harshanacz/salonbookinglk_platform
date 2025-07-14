import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { activityLogger } from "@/lib/adminActivityLogger";
import AdminActivity, { AdminActionType } from "@/models/AdminActivity";

export const dynamic = "force-dynamic";

// GET: Fetch admin activity logs (Super Admin only)
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only super admins can view activity logs
    if (user.type !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied: Super Admin required" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query options
    const queryOptions: any = {
      page,
      limit
    };

    if (adminId) queryOptions.adminId = adminId;
    if (action && action !== "all") queryOptions.action = action as AdminActionType;
    if (search) queryOptions.search = search;
    if (startDate) queryOptions.startDate = new Date(startDate);
    if (endDate) queryOptions.endDate = new Date(endDate);

    // Get activities
    const result = await activityLogger.getActivities(queryOptions);

    return NextResponse.json({
      activities: result.activities,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      pages: result.pagination.pages,
      source: 'mongodb'
    });

  } catch (error) {
    console.error("[SUPER_ADMIN_ACTIVITY_LOGS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}

/**
 * POST: Manual operations for activity logs management (Super Admin only)
 * 
 * This endpoint handles various administrative operations on activity logs:
 * 
 * 1. 'sync' action:
 *    - Purpose: Originally designed for syncing between Redis cache and MongoDB
 *    - Current implementation: Since we're using MongoDB-only, it returns current stats
 *    - Returns: Activity statistics for the last 30 days
 *    - Use case: Refresh button in the UI to get latest data
 * 
 * 2. 'cleanup' action:
 *    - Purpose: Remove old activity logs to maintain database performance
 *    - Parameters: daysToKeep (default: 365 days)
 *    - Returns: Number of deleted records
 *    - Use case: Scheduled cleanup or manual database maintenance
 * 
 * 3. 'stats' action:
 *    - Purpose: Get detailed statistics about admin activities
 *    - Parameters: days (default: 30 days)
 *    - Returns: Activity breakdown by action type, admin, etc.
 *    - Use case: Dashboard analytics and reporting
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only super admins can perform manual operations
    if (user.type !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied: Super Admin required" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'sync':
        /**
         * SYNC Operation:
         * - Originally designed for Redis-to-MongoDB synchronization
         * - Current behavior: Returns activity statistics as "sync status"
         * - Fetches stats for the last 30 days to show data freshness
         * - Used when user clicks "Refresh" button in the UI
         */
        const stats = await activityLogger.getActivityStats(30);
        return NextResponse.json({
          message: "Activity logs are up to date",
          stats
        });

      case 'cleanup':
        /**
         * CLEANUP Operation:
         * - Removes activity logs older than specified days
         * - Default: Keep 365 days (1 year) of activity logs
         * - Helps maintain database performance and storage
         * - Returns count of deleted records for confirmation
         */
        const daysToKeep = body.daysToKeep || 365;
        const deletedCount = await activityLogger.cleanupOldActivities(daysToKeep);
        return NextResponse.json({
          message: `Cleaned up ${deletedCount} old activity logs`,
          deletedCount
        });

      case 'stats':
        /**
         * STATS Operation:
         * - Provides detailed analytics about admin activities
         * - Default: Last 30 days, can be customized with 'days' parameter
         * - Returns breakdown by action types, most active admins, etc.
         * - Used for dashboard analytics and activity monitoring
         */
        const activityStats = await activityLogger.getActivityStats(body.days || 30);
        return NextResponse.json({ stats: activityStats });

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: 'sync', 'cleanup', 'stats'" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("[SUPER_ADMIN_ACTIVITY_LOGS_POST]", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
