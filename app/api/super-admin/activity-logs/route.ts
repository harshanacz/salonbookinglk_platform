import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { activityLogger } from "@/lib/adminActivityLogger";
import { AdminActionType } from "@/models/AdminActivity";

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

    // Only super admins can refresh activity logs
    if (user.type !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied: Super Admin required" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      
      // Automatic cleanup of logs older than 90 days
      const deletedCount = await activityLogger.cleanupOldActivities(90);
      
      // Get current statistics
      const stats = await activityLogger.getActivityStats(30);
      
      return NextResponse.json({
        message: "Activity logs refreshed successfully",
        stats,
        cleanup: {
          deletedCount,
          daysKept: 90,
          message: deletedCount > 0 
            ? `Automatically cleaned up ${deletedCount} logs older than 90 days`
            : null
        }
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Only 'refresh' action is supported" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("[SUPER_ADMIN_ACTIVITY_LOGS_POST]", error);
    return NextResponse.json(
      { error: "Failed to refresh activity logs" },
      { status: 500 }
    );
  }
}
