import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const dbUser = await User.findOne({ clerkUserId: user.id });
    
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      fullName: dbUser.userName || "",
      email: dbUser.email || "",
      mobileNumber: dbUser.mobileNumber || "",
      gender: dbUser.gender || "",
      country: dbUser.country || "",
      profileImage: dbUser.profileImage || "",
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      console.log("Authentication failed: No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    console.log("Authenticated user ID:", userId);

    const { fullName, mobileNumber, gender, country, profileImage } = await req.json();
    console.log("Received profile data:", { fullName, mobileNumber, gender, country, profileImage: profileImage ? "Image data received" : "No image" });

    await dbConnect();

    // First check if the user exists
    let dbUser = await User.findOne({ clerkUserId: userId });
    
    if (!dbUser) {
      // Create a new user if not exists
      dbUser = await User.create({
        clerkUserId: userId,
        type: "CUSTOMER", // Default type for this flow
        userName: fullName,
        mobileNumber,
        gender,
        country,
        profileImage,
        email: user.emailAddresses[0]?.emailAddress,
      });
      console.log("Created new user:", dbUser);
    } else {
      // Update the existing user
      const updateData: any = {
        userName: fullName,
        mobileNumber,
        gender,
        country,
      };
      
      // Only update profileImage if it's provided
      if (profileImage) {
        updateData.profileImage = profileImage;
      }
      
      dbUser = await User.findOneAndUpdate(
        { clerkUserId: userId },
        updateData,
        { new: true }
      );
      console.log("Updated existing user:", dbUser);
    }

    return NextResponse.json(
      { success: true, user: dbUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
