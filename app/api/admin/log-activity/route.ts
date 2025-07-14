import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";

// General activity logging API for client-side actions
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user || user.type !== "ADMIN") {
      return NextResponse.json({ error: "Not an admin user" }, { status: 403 });
    }

    const body = await req.json();
    const { action, details, target, metadata } = body;

    if (!action || !details) {
      return NextResponse.json({ error: "Action and details are required" }, { status: 400 });
    }

    // Validate that the action is a valid AdminActionType (excluding login/logout)
    const validActions = Object.values(AdminActionType);
    if (!validActions.includes(action as AdminActionType)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    logAdminActivity({
      adminId: user._id.toString(),
      adminName: user.userName || 'Unknown Admin',
      adminEmail: user.email || 'unknown@admin.com',
      action: action as AdminActionType,
      target: target || 'system',
      details,
      metadata: {
        clerkUserId: userId,
        timestamp: new Date().toISOString(),
        userType: user.type,
        ...metadata
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Activity logged successfully" 
    });
  } catch (error) {
    console.error("Error logging admin activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
