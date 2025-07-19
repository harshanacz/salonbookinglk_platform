import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { email } = body;

    // Find the user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already active
    if (user.isActive) {
      return NextResponse.json({ error: "Account is already active" }, { status: 400 });
    }

    // Verify email matches
    if (user.email !== email) {
      return NextResponse.json({ error: "Email does not match" }, { status: 400 });
    }

    // Check if 30-day period has expired
    if (user.deactivatedAt) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (user.deactivatedAt < thirtyDaysAgo) {
        return NextResponse.json({
          error: "Reactivation period has expired. Please contact support."
        }, { status: 400 });
      }
    }

    // Reactivate the user account
    user.isActive = true;
    user.deactivatedAt = null;
    await user.save();

    console.log(`[USER_REACTIVATE] User account reactivated: ${user.email || user.userName}`);

    return NextResponse.json({
      message: "Account reactivated successfully"
    });

  } catch (error) {
    console.error("[USER_REACTIVATE] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
