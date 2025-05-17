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
