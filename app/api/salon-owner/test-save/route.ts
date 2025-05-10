import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import SalonContext from "@/models/SalonContext";
import User, { UserType } from "@/models/User";
import { Day } from "@/models/SalonContext";
import dbConnect from "@/lib/mongodb";

export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    console.log("[TEST_SAVE] clerkUserId:", clerkUserId);
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    console.log("[TEST_SAVE] Connected to database");

    // Find the user first
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify user is a salon owner
    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("User is not a salon owner", { status: 403 });
    }

    // Create test working hours for all days
    const workingHours = Object.values(Day).map((day) => ({
      day,
      isWorking: true,
      start: "09:00",
      end: "18:00",
    }));

    // Create test business hours for all days
    const businessHours = Object.values(Day).map((day) => ({
      day,
      isOpen: true,
      open: "09:00",
      close: "18:00",
    }));

    // Create test salon data
    const testSalonData = {
      userId: user._id, // Use the MongoDB _id from User model
      numberOfReviewers: 0,
      reviewScore: 0,
      businessName: "Test Salon",
      description: "A test salon for development purposes",
      website: "https://testsalon.com",
      businessRegistrationNumber: "TEST123456",
      isVerified: false,
      location: {
        lat: 6.9271,
        lng: 79.8612,
      },
      phoneNumber: "+94771234567",
      ownerName: "Test Owner",
      workingHours,
      businessHours,
      profilePictureUrl: "https://i.ibb.co/KjpQp9cJ/image.png",
    };

    console.log("[TEST_SAVE] Attempting to save salon data:", testSalonData);

    // Update or create salon context
    const salonContext = await SalonContext.findOneAndUpdate(
      { userId: user._id }, // Use the MongoDB _id from User model
      testSalonData,
      { upsert: true, new: true }
    );

    console.log("[TEST_SAVE] Successfully saved salon data:", salonContext);

    return NextResponse.json(salonContext);
  } catch (error) {
    console.error("[TEST_SAVE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 