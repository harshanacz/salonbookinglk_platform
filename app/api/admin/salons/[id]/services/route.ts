import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service from "@/models/Service";
import Appointment from "@/models/Appointment";
import mongoose from "mongoose";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_SALON_SERVICES_GET] called with salon ID:", params.id);
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      console.log("[ADMIN_SALON_SERVICES_GET] Unauthorized - no userId");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to database
    console.log("[ADMIN_SALON_SERVICES_GET] Connecting to database...");
    await dbConnect();
    console.log("[ADMIN_SALON_SERVICES_GET] Database connected");

    // Check if admin user
    console.log("[ADMIN_SALON_SERVICES_GET] Checking admin user for clerkUserId:", userId);
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      console.log("[ADMIN_SALON_SERVICES_GET] Forbidden - user type:", adminUser?.type);
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }
    console.log("[ADMIN_SALON_SERVICES_GET] Admin user verified:", adminUser.type);

    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("[ADMIN_SALON_SERVICES_GET] Invalid salon ID format:", id);
      return new NextResponse("Invalid salon ID format", { status: 400 });
    }

    // Verify the salon exists
    console.log("[ADMIN_SALON_SERVICES_GET] Looking for salon with ID:", id);
    const salon = await User.findById(id);
    if (!salon || salon.type !== UserType.SALON_OWNER) {
      console.log("[ADMIN_SALON_SERVICES_GET] Salon not found or wrong type. Found:", salon?.type);
      return new NextResponse("Salon not found", { status: 404 });
    }
    console.log("[ADMIN_SALON_SERVICES_GET] Salon found:", salon.userName || salon.businessName);

    // Get query parameters for pagination and search
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    console.log("[ADMIN_SALON_SERVICES_GET] Query params - page:", page, "limit:", limit, "search:", search);

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

    console.log("[ADMIN_SALON_SERVICES_GET] Service query:", JSON.stringify(query));

    // Fetch services for this salon with error handling for populate
    let services;
    try {
      console.log("[ADMIN_SALON_SERVICES_GET] Fetching services with populate...");
      services = await Service.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('salonContextId', 'name')
        .lean(); // Use lean() for better performance
      console.log("[ADMIN_SALON_SERVICES_GET] Services fetched successfully, count:", services.length);
    } catch (populateError) {
      console.error("[ADMIN_SALON_SERVICES_GET] Populate failed, fetching without populate:", populateError);
      // Fallback: fetch without populate if populate fails
      services = await Service.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
      console.log("[ADMIN_SALON_SERVICES_GET] Services fetched without populate, count:", services.length);
    }

    // Count total services for pagination
    console.log("[ADMIN_SALON_SERVICES_GET] Counting total services...");
    const total = await Service.countDocuments(query);
    console.log("[ADMIN_SALON_SERVICES_GET] Total services found:", total);

    // Get service IDs for booking count calculation
    const serviceIds = services.map(service => service._id);
    
    // Calculate booking counts for all services using aggregation for better performance
    console.log("[ADMIN_SALON_SERVICES_GET] Calculating booking counts for services...");
    let bookingCountMap = new Map();
    
    try {
      const bookingCounts = await Appointment.aggregate([
        {
          $match: {
            serviceId: { $in: serviceIds }
          }
        },
        {
          $group: {
            _id: "$serviceId",
            bookingCount: { $sum: 1 }
          }
        }
      ]);
      
      // Convert booking counts to a map for easy lookup
      bookingCounts.forEach(item => {
        bookingCountMap.set(item._id.toString(), item.bookingCount);
      });
      console.log("[ADMIN_SALON_SERVICES_GET] Booking counts calculated for", bookingCounts.length, "services");
    } catch (bookingError) {
      console.error("[ADMIN_SALON_SERVICES_GET] Error calculating booking counts:", bookingError);
      // Continue without booking counts if there's an error
    }

    // Transform services to match the expected format
    const formattedServices = services.map(service => {
      // Handle populated salonContextId safely
      const salonContextName = service.salonContextId && 
        typeof service.salonContextId === 'object' && 
        'name' in service.salonContextId 
          ? (service.salonContextId as any).name 
          : 'Unknown';

      // Get actual booking count from appointments
      const actualBookingCount = bookingCountMap.get(service._id.toString()) || 0;

      return {
        id: service._id.toString(),
        name: service.title,
        price: service.price,
        duration: `${service.duration} minutes`,
        description: service.description || '',
        type: service.type,
        status: service.status,
        images: service.images || [],
        bookings: actualBookingCount, // Use calculated booking count
        views: service.views || 0,
        averageRating: service.averageRating || 0,
        reviewCount: service.reviewCount || 0,
        salonContext: salonContextName,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      };
    });

    console.log("[ADMIN_SALON_SERVICES_GET] Returning response with", formattedServices.length, "services");
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
    console.error("[ADMIN_SALON_SERVICES_GET] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      salonId: params?.id
    });
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
