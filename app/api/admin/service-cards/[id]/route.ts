import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
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
        select: "userName businessName",
      })
      .lean();

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Create a serializable version of the service with string IDs
    const serializedService = {
      ...service,
      _id: service._id.toString(),
      userId: service.userId ? {
        ...service.userId,
        _id: service.userId._id ? service.userId._id.toString() : undefined
      } : service.userId
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