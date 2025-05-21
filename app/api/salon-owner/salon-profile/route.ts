import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify user is a salon owner
    if (user.type !== UserType.SALON_OWNER) {
      return NextResponse.json({ message: "User is not a salon owner" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      businessName,
      description,
      location,
      website,
      phoneNumber,
      ownerName,
      businessRegistrationNumber,
      businessHours,
      profilePictureUrl
    } = body;

    // Create salon context
    const salonContext = await SalonContext.create({
      userId: user._id,
      businessName,
      description,
      location,
      website,
      phoneNumber,
      ownerName,
      businessRegistrationNumber,
      businessHours,profilePictureUrl 
    });

    return NextResponse.json(salonContext);
  } catch (error) {
    console.error("[SALON_POST]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // Find the user first
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const salonContext = await SalonContext.findOne({ userId: user._id });
    if (!salonContext) {
      return NextResponse.json({ message: "Salon not found" }, { status: 404 });
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
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    console.log("[SALON_PROFILE_GET] Fetching user with clerkUserId:", clerkUserId);

    // Find the user first
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      console.log("[SALON_PROFILE_GET] User not found");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("[SALON_PROFILE_GET] Found user:", user._id);

    // Find salon context using the user's MongoDB _id
    const salonContext = await SalonContext.findOne({ userId: user._id });
    console.log("[SALON_PROFILE_GET] Found salon context:", salonContext);
    
    if (!salonContext) {
      console.log("[SALON_PROFILE_GET] Salon not found");
      return NextResponse.json({ message: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json(salonContext);
  } catch (error) {
    console.error("[SALON_PROFILE_GET]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}