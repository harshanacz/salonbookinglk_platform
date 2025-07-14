import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";
import { auth } from "@clerk/nextjs/server";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

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
        select: "userName businessName type",
      })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .lean();

    // Format the response data
    const formattedServices = pendingServices.map((service) => ({
      id: service._id,
      title: service.title,
      image: service.images[0] || "/placeholder.svg?height=100&width=100", // Use first image or placeholder
      salon: (service.userId as any)?.businessName || "Unknown Salon",
      status: "NEW", // If there's no updatedAt or it's same as createdAt
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

// API for approving a service
export async function PATCH(request: Request) {
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

    // Parse the request body
    const { serviceId, approved } = await request.json();
    
    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Update the service status
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { 
        status: approved ? ServiceStatus.ACTIVE : ServiceStatus.REJECTED 
      },
      { new: true }
    ).populate({
      path: "userId",
      select: "email businessName"
    });

    if (!updatedService) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Log admin activity
    try {
      const adminInfo = await getAdminInfo();
      if (adminInfo) {
        const actionType = AdminActionType.SERVICE_VERIFICATION;
        const details = approved 
          ? `Approved service "${updatedService.title}"`
          : `Rejected service "${updatedService.title}"`;

        // Use salon owner's email as target, fallback to service name if email not available
        const salonOwner = updatedService.userId as any;
        const target = salonOwner?.email || `service: ${updatedService.title}`;

        logAdminActivity({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          adminEmail: adminInfo.adminEmail,
          action: actionType,
          target: target,
          details,
          metadata: {
            serviceId,
            serviceName: updatedService.title,
            salonOwnerEmail: salonOwner?.email,
            salonBusinessName: salonOwner?.businessName,
            action: approved ? 'approved' : 'rejected',
            previousStatus: 'PENDING',
            newStatus: approved ? 'ACTIVE' : 'REJECTED'
          }
        });
      }
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Service ${approved ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error("Error updating service status:", error);
    return NextResponse.json(
      { error: "Failed to update service status" },
      { status: 500 }
    );
  }
}