import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify user is a salon owner
    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("User is not a salon owner", { status: 403 });
    }

    const body = await req.json();
    const { 
      businessName,
      website,
      businessRegistrationNumber,
      businessCategory,
      streetAddress,
      city,
      postalCode,
      workingHours
    } = body;

    // Create salon context
    const salonContext = await SalonContext.create({
      userId: user._id,
      businessName,
      website,
      businessRegistrationNumber,
      businessCategory,
      streetAddress,
      city,
      postalCode,
      workingHours
    });

    return NextResponse.json(salonContext);
  } catch (error) {
    console.error("[SALON_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 