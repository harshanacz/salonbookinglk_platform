import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";

export async function GET(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    const salon = await SalonContext.findOne({ userId: user._id })
      .select('businessName description profilePictureUrl');

    if (!salon) {
      return new NextResponse("Salon not found", { status: 404 });
    }

    return NextResponse.json(salon);

  } catch (error: any) {
    console.error("[SALON_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: error.message || "Internal Error",
        error: error.toString()
      }), 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    const body = await req.json();
    const { businessName, description, location, phoneNumber, ownerName, businessHours } = body;

    // Validate required fields
    if (!businessName || !description || !location || !phoneNumber || !ownerName || !businessHours) {
      return new NextResponse(
        JSON.stringify({
          message: "Missing required fields",
          receivedData: { businessName, description, location, phoneNumber, ownerName, businessHours }
        }), 
        { status: 400 }
      );
    }

    // Create or update salon
    const salon = await SalonContext.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        businessName,
        description,
        location,
        phoneNumber,
        ownerName,
        businessHours,
        ...body // Include any additional fields from the request
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(salon, { status: 201 });

  } catch (error: any) {
    console.error("[SALON_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: error.message || "Internal Error",
        error: error.toString()
      }), 
      { status: 500 }
    );
  }
}
