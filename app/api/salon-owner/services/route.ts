import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service, { ServiceStatus } from "@/models/Service"; // Import Service model and Status enum

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Find the user in your database
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify user is a salon owner
    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      type,
      description,
      images, // Expecting an array of image URLs from UploadThing
      price,
      duration,
      staffAssigned, // Expecting an array of Staff ObjectIds
      // Add any other fields from your form steps
    } = body;

    // Basic validation (consider using a library like Zod for more robust validation)
    if (!title || !type || !price || !duration) {
        return new NextResponse("Missing required fields", { status: 400 });
    }
    if (images && !Array.isArray(images)) {
        return new NextResponse("Images must be an array", { status: 400 });
    }
     if (images && images.length > 3) {
        return new NextResponse("Maximum of 3 images allowed", { status: 400 });
    }


    // Create the new service
    const newService = await Service.create({
      userId: user._id, // Link service to the salon owner's user ID in your DB
      title,
      type,
      description,
      images: images || [], // Ensure images is an array
      price,
      duration,
      staffAssigned: staffAssigned || [], // Ensure staffAssigned is an array
      status: ServiceStatus.PENDING, // Set initial status to PENDING
      // Add other fields as needed
    });

    return NextResponse.json(newService, { status: 201 }); // Return the created service

  } catch (error: any) {
    console.error("[SERVICE_POST]", error);
     // Handle potential validation errors from Mongoose
     if (error.name === 'ValidationError') {
        return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// You might also want a GET endpoint to fetch services later
// export async function GET(req: Request) { ... }
