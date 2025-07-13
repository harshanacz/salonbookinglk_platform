import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import SalonContext from "@/models/SalonContext";
import Staff from "@/models/Staff";
import { auth } from "@clerk/nextjs/server";
import { Document } from "mongoose";

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