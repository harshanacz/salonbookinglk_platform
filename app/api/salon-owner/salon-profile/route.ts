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

export async function PATCH(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // Find the user first
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const salonContext = await SalonContext.findOne({ userId: user._id });
    if (!salonContext) {
      return new NextResponse("Salon not found", { status: 404 });
    }

    // Only update fields provided in the request body
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined) {
        salonContext[key] = body[key];
      }
    });

    await salonContext.save();
    return NextResponse.json(salonContext);
  } catch (error) {
    console.error("[SALON_PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    console.log("[SALON_PROFILE_GET] Fetching user with clerkUserId:", clerkUserId);

    // Find the user first
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      console.log("[SALON_PROFILE_GET] User not found");
      return new NextResponse("User not found", { status: 404 });
    }

    console.log("[SALON_PROFILE_GET] Found user:", user._id);

    // Find salon context using the user's MongoDB _id
    const salonContext = await SalonContext.findOne({ userId: user._id });
    console.log("[SALON_PROFILE_GET] Found salon context:", salonContext);
    
    if (!salonContext) {
      console.log("[SALON_PROFILE_GET] Salon not found");
      return new NextResponse("Salon not found", { status: 404 });
    }

    return NextResponse.json(salonContext);
  } catch (error) {
    console.error("[SALON_PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 