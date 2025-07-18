import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

// Unified admin activity logging API
export async function POST(req: NextRequest) {
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

    // Only allow admin users
    if (user.type !== "ADMIN") {
      return NextResponse.json({ error: "Not an admin user" }, { status: 403 });
    }

    const body = await req.json();
    const { action, details, target, metadata } = body;

    // Handle empty body as LOGIN action (from useAdminLoginTracking)
    const activityAction = action || AdminActionType.LOGIN;
    const activityDetails = details || `Admin logged into the system`;
    const activityTarget = target || 'system';

    // Validate that the action is a valid AdminActionType
    const validActions = Object.values(AdminActionType);
    if (!validActions.includes(activityAction as AdminActionType)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Prepare unified activity data
    const activityData = {
      action: activityAction as AdminActionType,
      target: activityTarget,
      details: activityDetails,
      metadata: {
        clerkUserId: userId,
        timestamp: new Date().toISOString(),
        userType: user.type,
        ...(activityAction === AdminActionType.LOGIN && { loginTime: new Date().toISOString() }),
        ...metadata
      }
    };

    const successMessage = activityAction === AdminActionType.LOGIN 
      ? "Login activity logged successfully" 
      : "Activity logged successfully";

    // Log the activity using shared logic
    try {
      const adminInfo = await getAdminInfo();
      if (adminInfo) {
        logAdminActivity({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          adminEmail: adminInfo.adminEmail,
          ...activityData
        });
      }
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: successMessage 
    });
  } catch (error) {
    console.error("Error logging admin activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
