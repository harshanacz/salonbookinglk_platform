import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      console.log("Profile check: No authenticated user found");
      return NextResponse.json({ isComplete: false }, { status: 200 });
    }

    console.log("Profile check for user ID:", user.id);
    await dbConnect();

    const dbUser = await User.findOne({ clerkUserId: user.id });
    
    if (!dbUser) {
      console.log("Profile check: User not found in database");
      return NextResponse.json({ isComplete: false }, { status: 200 });
    }

    // Check if user is deactivated and can be reactivated
    if (!dbUser.isActive) {
      console.log("Profile check: User is deactivated, checking reactivation eligibility");
      
      // Check if 30-day period has expired
      if (dbUser.deactivatedAt) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (dbUser.deactivatedAt < thirtyDaysAgo) {
          console.log("Profile check: Reactivation period expired");
          return NextResponse.json({ 
            isComplete: false,
            reactivationExpired: true,
            error: "Account reactivation period has expired. Please contact support."
          }, { status: 400 });
        }
      }

      // Reactivate the user account
      dbUser.isActive = true;
      dbUser.deactivatedAt = null;
      await dbUser.save();

      console.log(`[USER_PROFILE_CHECK] User account reactivated on access: ${dbUser.email || dbUser.userName}`);
      
      // Return with reactivation flag
      const isComplete = Boolean(
        dbUser.userName &&
        dbUser.mobileNumber &&
        dbUser.gender &&
        dbUser.country
      );

      return NextResponse.json({ 
        isComplete,
        reactivated: true,
        message: "Welcome back! Your account has been reactivated."
      }, { status: 200 });
    }

    // Check if essential profile fields are filled
    const isComplete = Boolean(
      dbUser.userName &&
      dbUser.mobileNumber &&
      dbUser.gender &&
      dbUser.country
    );

    console.log("Profile complete status:", isComplete);
    return NextResponse.json({ isComplete }, { status: 200 });
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return NextResponse.json({ isComplete: false }, { status: 200 });
  }
}
