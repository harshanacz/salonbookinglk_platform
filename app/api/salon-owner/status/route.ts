import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log("[STATUS_API] User ID:", userId);
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Unauthorized" 
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get user data
    const user = await User.findOne({ clerkUserId: userId });
    console.log("[STATUS_API] User found:", !!user);
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: "User not found" 
        },
        { status: 404 }
      );
    }

    // Find salon context to get business name
    const salonContext = await SalonContext.findOne({ userId: user._id });
    console.log("[STATUS_API] Salon context found:", !!salonContext);
    
    if (!salonContext) {
      return NextResponse.json(
        { 
          success: false,
          error: "Salon profile not found" 
        },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      userId: user._id,  // Add the database user ID
      isActive: user.isActive,
      deactivatedAt: user.deactivatedAt,
      businessName: salonContext.businessName,
    };
    
    console.log("[STATUS_API] Response:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("[SALON_STATUS_ERROR]", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
