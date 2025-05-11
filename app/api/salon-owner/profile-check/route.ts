import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ 
        isComplete: false, 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ 
        isComplete: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    // Check if user is salon owner
    if (user.type !== UserType.SALON_OWNER) {
      return NextResponse.json({ 
        isComplete: false, 
        message: "User is not a salon owner" 
      }, { status: 403 });
    }

    // Find salon context
    const salonContext = await SalonContext.findOne({ userId: user._id });
    
    if (!salonContext) {
      return NextResponse.json({ 
        isComplete: false,
        message: "Salon profile not created" 
      });
    }

    // Check required fields
    const requiredFields = [
      'businessName', 
      'description', 
      'ownerName', 
      'phoneNumber',
      'location'
    ];
    
    const missingFields = requiredFields.filter(field => 
      !salonContext[field] || 
      (field === 'location' && (!salonContext.location.lat || !salonContext.location.lng))
    );

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        isComplete: false,
        message: "Profile incomplete",
        missingFields
      });
    }

    return NextResponse.json({ 
      isComplete: true,
      message: "Profile complete" 
    });
  } catch (error) {
    console.error("[PROFILE_CHECK]", error);
    return NextResponse.json({ 
      isComplete: false, 
      message: "Internal error" 
    }, { status: 500 });
  }
}
