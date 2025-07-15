import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

// POST: Log admin login activity
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

    if (user.type === "ADMIN") {
      try {
        const adminInfo = await getAdminInfo();
        if (adminInfo) {
          logAdminActivity({
            adminId: adminInfo.adminId,
            adminName: adminInfo.adminName,
            adminEmail: adminInfo.adminEmail,
            action: AdminActionType.LOGIN,
            target: 'system',
            details: `Admin logged into the system`,
            metadata: {
              loginTime: new Date().toISOString(),
              userType: user.type
            }
          });
        }
      } catch (error) {
        console.error('Failed to log login activity:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Login activity logged successfully" 
    });

  } catch (error) {
    console.error("[ADMIN_LOGIN_ACTIVITY]", error);
    return NextResponse.json(
      { error: "Failed to log login activity" },
      { status: 500 }
    );
  }
}
