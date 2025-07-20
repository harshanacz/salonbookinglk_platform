import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
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

    // Fetch all services with PENDING status
    const pendingServices = await Service.find({ status: ServiceStatus.PENDING })
      .populate({
        path: "userId",
        select: "userName businessName email type",
      })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .lean();

    // Format the response data
    const formattedServices = pendingServices.map((service) => ({
      id: service._id,
      title: service.title,
      image: service.images[0] || "/placeholder.svg?height=100&width=100", // Use first image or placeholder
      salon: (service.userId as any)?.businessName || "Unknown Salon",
      email: (service.userId as any)?.email || "No email", // Add email field
      status: "NEW", // If there's no updatedAt or it's same as createdAt
      createdAt: service.createdAt, // Add raw createdAt for date filtering
      startedDate: service.createdAt 
        ? new Date(service.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
        : "-",
      updatedDate: service.updatedAt 
        ? new Date(service.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
        : "-",
    }));

    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error("Error fetching pending services:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending services" },
      { status: 500 }
    );
  }
}