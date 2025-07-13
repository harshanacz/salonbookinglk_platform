import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { activityLogger } from "@/lib/adminActivityLogger";
import AdminActivity, { AdminActionType } from "@/models/AdminActivity";

export const dynamic = "force-dynamic";

// GET: Fetch admin activity logs
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

    // Only super admins and admins can view activity logs
    if (!["ADMIN", "SUPER_ADMIN"].includes(user.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

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
    console.error("[ADMIN_ACTIVITY_LOGS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}

// POST: Manual operations (like sync, cleanup, etc.)
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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'sync':
        // For MongoDB-only implementation, sync is not needed
        // But we can return stats
        const stats = await activityLogger.getActivityStats(30);
        return NextResponse.json({
          message: "Activity logs are up to date",
          stats
        });

      case 'cleanup':
        const daysToKeep = body.daysToKeep || 365;
        const deletedCount = await activityLogger.cleanupOldActivities(daysToKeep);
        return NextResponse.json({
          message: `Cleaned up ${deletedCount} old activity logs`,
          deletedCount
        });

      case 'stats':
        const activityStats = await activityLogger.getActivityStats(body.days || 30);
        return NextResponse.json({ stats: activityStats });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("[ADMIN_ACTIVITY_LOGS_POST]", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
