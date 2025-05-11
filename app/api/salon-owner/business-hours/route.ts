import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext, { Day } from "@/models/SalonContext";

// API route to get business hours
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the user first
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find salon context using the user's MongoDB _id
    const salonContext = await SalonContext.findOne({ userId: user._id });
    if (!salonContext) {
      return NextResponse.json({ message: "Salon not found" }, { status: 404 });
    }

    // Return just the business hours
    return NextResponse.json(salonContext.businessHours || []);
  } catch (error) {
    console.error("[BUSINESS_HOURS_GET]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

// API route to update business hours
export async function PATCH(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { businessHours } = body;

    if (!businessHours || !Array.isArray(businessHours) || businessHours.length !== 7) {
      return NextResponse.json(
        { message: "Invalid business hours format. Must provide all 7 days." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user first
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find and update salon context
    const salonContext = await SalonContext.findOne({ userId: user._id });
    if (!salonContext) {
      return NextResponse.json({ message: "Salon not found" }, { status: 404 });
    }

    // Validate each business hour entry
    for (const hour of businessHours) {
      if (!Object.values(Day).includes(hour.day)) {
        return NextResponse.json(
          { message: `Invalid day format: ${hour.day}` },
          { status: 400 }
        );
      }

      if (typeof hour.isOpen !== 'boolean') {
        return NextResponse.json(
          { message: "isOpen must be a boolean" },
          { status: 400 }
        );
      }

      if (hour.isOpen && (!hour.open || !hour.close)) {
        return NextResponse.json(
          { message: "Open days must have open and close times" },
          { status: 400 }
        );
      }
    }

    // Update business hours
    salonContext.businessHours = businessHours;
    await salonContext.save();

    return NextResponse.json(salonContext.businessHours);
  } catch (error) {
    console.error("[BUSINESS_HOURS_PATCH]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
