import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service from "@/models/Service";
import mongoose from "mongoose";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_SALON_SERVICES_GET] called");
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid salon ID format", { status: 400 });
    }

    // Verify the salon exists
    const salon = await User.findById(id);
    if (!salon || salon.type !== UserType.SALON_OWNER) {
      return new NextResponse("Salon not found", { status: 404 });
    }

    // Get query parameters for pagination and search
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // Build query for services
    let query: any = { userId: salon._id };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } }
      ];
    }

    // Fetch services for this salon
    const services = await Service.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('salonContextId', 'name');

    // Count total services for pagination
    const total = await Service.countDocuments(query);

    // Transform services to match the expected format
    const formattedServices = services.map(service => ({
      id: service._id.toString(),
      name: service.title,
      price: service.price,
      duration: `${service.duration} minutes`,
      description: service.description || '',
      type: service.type,
      status: service.status,
      images: service.images,
      bookings: service.bookings,
      views: service.views,
      averageRating: service.averageRating,
      reviewCount: service.reviewCount,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }));

    return NextResponse.json({
      services: formattedServices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[ADMIN_SALON_SERVICES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_SALON_SERVICES_PATCH] called");
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid salon ID format", { status: 400 });
    }

    // Verify the salon exists
    const salon = await User.findById(id);
    if (!salon || salon.type !== UserType.SALON_OWNER) {
      return new NextResponse("Salon not found", { status: 404 });
    }

    const body = await req.json();
    const { serviceId, status } = body;

    // Validate service ID
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return new NextResponse("Invalid service ID format", { status: 400 });
    }

    // Find the service first to get the previous status
    const service = await Service.findOne({ _id: serviceId, userId: salon._id });
    if (!service) {
      return new NextResponse("Service not found", { status: 404 });
    }

    const previousStatus = service.status;

    // Update the service
    const updatedService = await Service.findOneAndUpdate(
      { _id: serviceId, userId: salon._id },
      { status: status },
      { new: true }
    );

    if (!updatedService) {
      return new NextResponse("Service not found", { status: 404 });
    }

    // Log admin activity
    try {
      const adminInfo = await getAdminInfo();
      if (adminInfo) {
        // Use salon owner's email as target
        const target = salon.email || `salon: ${salon.userName || salon.businessName || 'Unknown'}`;
        
        logAdminActivity({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          adminEmail: adminInfo.adminEmail,
          action: AdminActionType.SERVICE_STATUS_TOGGLE,
          target: target,
          details: `Changed service "${updatedService.title}" status from ${previousStatus} to ${status}`,
          metadata: {
            serviceId: updatedService._id.toString(),
            serviceName: updatedService.title,
            salonId: salon._id.toString(),
            salonName: salon.userName || salon.businessName,
            salonEmail: salon.email,
            previousStatus,
            newStatus: status
          }
        });
      }
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }

    return NextResponse.json({
      message: `Service ${status.toLowerCase()} successfully`,
      service: {
        id: updatedService._id.toString(),
        name: updatedService.title,
        status: updatedService.status
      }
    });
  } catch (error) {
    console.error("[ADMIN_SALON_SERVICES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
