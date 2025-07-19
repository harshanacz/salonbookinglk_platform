import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get user data
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find salon context to verify this is a salon owner
    const salonContext = await SalonContext.findOne({ userId: user._id });
    if (!salonContext) {
      return NextResponse.json(
        { error: "Salon profile not found" },
        { status: 404 }
      );
    }

    // Check if account is actually deactivated
    if (user.isActive) {
      return NextResponse.json(
        { error: "Account is already active" },
        { status: 400 }
      );
    }

    // Check if deactivation period has expired (30 days)
    if (user.deactivatedAt) {
      const daysSinceDeactivation = (Date.now() - user.deactivatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDeactivation > 30) {
        return NextResponse.json(
          { error: "Reactivation period has expired. Please contact support." },
          { status: 400 }
        );
      }
    }

    // Reactivate the user account
    await User.findByIdAndUpdate(user._id, {
      isActive: true,
      deactivatedAt: null,
    });

    return NextResponse.json({
      message: "Account reactivated successfully!",
      reactivatedAt: new Date(),
    });

  } catch (error) {
    console.error("[SALON_REACTIVATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
