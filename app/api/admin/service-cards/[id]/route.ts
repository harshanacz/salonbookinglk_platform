import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import SalonContext from "@/models/SalonContext";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to the database
    await dbConnect();

    // Authorization check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const serviceId = params.id;
    
    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Fetch the specific service by ID
    const service = await Service.findById(serviceId)
      .populate({
        path: "userId",
        select: "userName businessName email mobileNumber profileImage clerkUserId type gender country",
      })
      .lean();

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Fetch salon context information
    let salonContext = null;
    if (service.userId && service.userId._id) {
      salonContext = await SalonContext.findOne({ userId: service.userId._id }).lean();
    }

    // Create a serializable version of the service with string IDs
    const serializedService = {
      ...service,
      _id: service._id.toString(),
      userId: service.userId ? {
        ...service.userId,
        _id: service.userId._id ? service.userId._id.toString() : undefined
      } : service.userId,
      salonContext: salonContext && !Array.isArray(salonContext) ? {
        ...salonContext,
        _id: (salonContext as { _id: any })._id.toString(),
        userId: (salonContext as { userId?: any }).userId?.toString()
      } : null
    };

    return NextResponse.json(serializedService);
  } catch (error) {
    console.error("Error fetching service details:", error);
    return NextResponse.json(
      { error: "Failed to fetch service details" },
      { status: 500 }
    );
  }
}