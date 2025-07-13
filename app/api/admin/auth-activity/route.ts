import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";

// Simple login/logout tracking API for admin users
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.type)) {
      return NextResponse.json({ error: "Not an admin user" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body; // 'login' or 'logout'

    if (!["login", "logout"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const adminActionType = action === "login" ? AdminActionType.LOGIN : AdminActionType.LOGOUT;
    const details = action === "login" 
      ? "Admin logged in to the system" 
      : "Admin logged out from the system";

    logAdminActivity({
      adminId: user._id.toString(),
      adminName: user.userName || 'Unknown Admin',
      adminEmail: user.email || 'unknown@admin.com',
      action: adminActionType,
      target: 'system',
      details,
      metadata: {
        clerkUserId: userId,
        timestamp: new Date().toISOString(),
        userType: user.type,
        action
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `${action} activity logged successfully` 
    });

  } catch (error) {
    console.error('Error logging auth activity:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
