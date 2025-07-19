import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";
import SalonContext from "@/models/SalonContext";
import Staff from "@/models/Staff";
import { auth } from "@clerk/nextjs/server";
import { Document } from "mongoose";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

interface StaffDocument extends Document {
  _id: string;
  name: string;
  role: string;
  profileImage: string;
  bio: string;
  availability: string;
  workingDays: string[];
}

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
        select: "userName businessName email mobileNumber profileImage clerkUserId type gender country isActive",
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

    // Fetch staff details for assigned staff members
    let staffDetails: StaffDocument[] = [];
    if (service.staffAssigned && service.staffAssigned.length > 0) {
      const staffIds = service.staffAssigned.filter(id => id !== 'any');
      if (staffIds.length > 0) {
        staffDetails = (await Staff.find({
          _id: { $in: staffIds }
        }).select('name role profileImage bio availability workingDays').lean()) as unknown as StaffDocument[];
      }
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
      } : null,
      staffDetails: staffDetails.map(staff => ({
        ...staff,
        _id: staff._id.toString()
      }))
    };

    return NextResponse.json(serializedService);
  } catch (error) {
    console.error("[SERVICE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH method for approving/rejecting a service
export async function PATCH(
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

    // Parse the request body
    const { action } = await request.json(); // 'approve' or 'reject'
    const serviceId = params.id;
    
    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Update the service status
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { 
        status: action === 'approve' ? ServiceStatus.ACTIVE : ServiceStatus.REJECTED 
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
        const details = action === 'approve'
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
            action: action,
            previousStatus: 'PENDING',
            newStatus: action === 'approve' ? 'ACTIVE' : 'REJECTED'
          }
        });
      }
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Service ${action}d successfully`,
      service: {
        id: updatedService._id.toString(),
        name: updatedService.title,
        status: updatedService.status
      }
    });
  } catch (error) {
    console.error("[SERVICE_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update service status" },
      { status: 500 }
    );
  }
}