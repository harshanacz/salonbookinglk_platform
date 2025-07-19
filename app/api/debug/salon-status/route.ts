import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkUserId: userId });
    const salonContext = user ? await SalonContext.findOne({ userId: user._id }) : null;

    return NextResponse.json({
      debug: {
        clerkUserId: userId,
        userFound: !!user,
        userEmail: user?.email,
        userType: user?.type,
        userActive: user?.isActive,
        userDeactivatedAt: user?.deactivatedAt,
        salonFound: !!salonContext,
        salonName: salonContext?.businessName,
        salonVerified: salonContext?.isVerified,
      }
    });

  } catch (error: any) {
    console.error("[DEBUG_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
