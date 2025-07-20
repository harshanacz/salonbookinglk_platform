import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is deactivated
    if (user.isActive) {
      return NextResponse.json(
        { message: "Account is already active" },
        { status: 200 }
      );
    }

    // Check if deactivation is within 30 days
    if (user.deactivatedAt) {
      const deactivatedDate = new Date(user.deactivatedAt);
      const currentDate = new Date();
      const daysDifference = Math.floor(
        (currentDate.getTime() - deactivatedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference > 30) {
        return NextResponse.json(
          { 
            error: "Account cannot be reactivated after 30 days. Please contact support.",
            daysSinceDeactivation: daysDifference 
          },
          { status: 400 }
        );
      }
    }

    // Reactivate the user account
    user.isActive = true;
    user.deactivatedAt = null;
    await user.save();

    return NextResponse.json({
      message: "Account reactivated successfully",
      reactivatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error reactivating account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
