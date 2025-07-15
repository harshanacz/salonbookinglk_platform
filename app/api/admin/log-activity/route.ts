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

    // Determine activity type and prepare activity data
    let activityData;
    let successMessage;

    if (!action && !details) {
      // Handle LOGIN action (from useAdminLoginTracking)
      activityData = {
        action: AdminActionType.LOGIN,
        target: 'system',
        details: `Admin logged into the system`,
        metadata: {
          clerkUserId: userId,
          timestamp: new Date().toISOString(),
          userType: user.type,
          loginTime: new Date().toISOString()
        }
      };
      successMessage = "Login activity logged successfully";
    } else {
      // Handle general activities (logout, etc.)
      if (!action || !details) {
        return NextResponse.json({ error: "Action and details are required" }, { status: 400 });
      }

      // Validate that the action is a valid AdminActionType
      const validActions = Object.values(AdminActionType);
      if (!validActions.includes(action as AdminActionType)) {
        return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
      }

      activityData = {
        action: action as AdminActionType,
        target: target || 'system',
        details,
        metadata: {
          clerkUserId: userId,
          timestamp: new Date().toISOString(),
          userType: user.type,
          ...metadata
        }
      };
      successMessage = "Activity logged successfully";
    }

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
