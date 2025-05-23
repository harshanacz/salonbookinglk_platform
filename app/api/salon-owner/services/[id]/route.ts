import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service from "@/models/Service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const service = await Service.findOne({ _id: params.id, userId: user._id });

    if (!service) {
      return new NextResponse("Service not found", { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error("[SERVICE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { title, type, description, images, price, duration, staffAssigned } = body;

    // Validate required fields
    if (!title || !type || !price || !duration) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate images array
    if (images && !Array.isArray(images)) {
      return new NextResponse("Images must be an array", { status: 400 });
    }
    if (images && images.length > 3) {
      return new NextResponse("Maximum of 3 images allowed", { status: 400 });
    }

    const service = await Service.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      {
        title,
        type,
        description,
        images: images || [],
        price,
        duration,
        staffAssigned: staffAssigned || []
      },
      { new: true }
    );

    if (!service) {
      return new NextResponse("Service not found", { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    console.error("[SERVICE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 