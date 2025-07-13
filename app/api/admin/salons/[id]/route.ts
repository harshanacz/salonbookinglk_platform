import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_SALON_GET_BY_ID] called");
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

    // Find the salon owner by ID
    const salon = await User.findById(id);
    
    if (!salon) {
      return new NextResponse("Salon not found", { status: 404 });
    }

    // Verify that this user is actually a salon owner
    if (salon.type !== UserType.SALON_OWNER) {
      return new NextResponse("User is not a salon owner", { status: 400 });
    }

    // Get salon statistics
    let totalBookings = 0;
    let totalRevenue = 0;
    let activeServices = 0;

    try {
      // Count total appointments for this salon
      totalBookings = await Appointment.countDocuments({
        salonId: salon._id
      });

      // Calculate total revenue from completed appointments
      const revenueData = await Appointment.aggregate([
        { $match: { salonId: salon._id, status: "Completed" } },
        { $lookup: {
            from: "services",
            localField: "serviceId",
            foreignField: "_id",
            as: "service"
          }
        },
        { $unwind: "$service" },
        { $group: {
            _id: null,
            totalRevenue: { $sum: "$service.price" }
          }
        }
      ]);

      totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

      // Count active services for this salon
      activeServices = await Service.countDocuments({
        salonId: salon._id,
        isActive: true
      });
    } catch (statsError) {
      console.error("Error calculating salon statistics:", statsError);
      // Continue without stats if there's an error
    }

    // Return salon data with statistics
    const salonData = {
      ...salon.toObject(),
      statistics: {
        totalBookings,
        totalRevenue,
        activeServices
      }
    };

    return NextResponse.json(salonData);
  } catch (error) {
    console.error("[ADMIN_SALON_GET_BY_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_SALON_PUT] called");
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

    const body = await req.json();
    const { status, ...updateData } = body;

    // Find and update the salon
    const updatedSalon = await User.findByIdAndUpdate(
      id,
      { ...updateData, ...(status && { status }) },
      { new: true, runValidators: true }
    );

    if (!updatedSalon) {
      return new NextResponse("Salon not found", { status: 404 });
    }

    // Verify that this user is actually a salon owner
    if (updatedSalon.type !== UserType.SALON_OWNER) {
      return new NextResponse("User is not a salon owner", { status: 400 });
    }

    return NextResponse.json(updatedSalon);
  } catch (error) {
    console.error("[ADMIN_SALON_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_SALON_DELETE] called");
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

    // Find the salon
    const salon = await User.findById(id);
    
    if (!salon) {
      return new NextResponse("Salon not found", { status: 404 });
    }

    // Verify that this user is actually a salon owner
    if (salon.type !== UserType.SALON_OWNER) {
      return new NextResponse("User is not a salon owner", { status: 400 });
    }

    // Instead of deleting, we'll deactivate the salon
    const deactivatedSalon = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    return NextResponse.json({ 
      message: "Salon deactivated successfully",
      salon: deactivatedSalon 
    });
  } catch (error) {
    console.error("[ADMIN_SALON_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
