import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service, { ServiceStatus } from "@/models/Service";
import mongoose from "mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_SALON_TOGGLE_STATUS] called");
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

    // Toggle the salon's active status
    const newActiveStatus = !salon.isActive;
    
    const updatedSalon = await User.findByIdAndUpdate(
      id,
      { isActive: newActiveStatus },
      { new: true }
    );

    // If deactivating the salon, also deactivate all its services
    if (!newActiveStatus) {
      await Service.updateMany(
        { userId: salon._id },
        { status: ServiceStatus.INACTIVE }
      );
    }
    
    // If activating the salon, set services back to ACTIVE (or keep their previous status)
    // You might want to store previous status and restore it, but for now we'll set to ACTIVE
    if (newActiveStatus) {
      await Service.updateMany(
        { userId: salon._id, status: ServiceStatus.INACTIVE },
        { status: ServiceStatus.ACTIVE }
      );
    }

    return NextResponse.json({ 
      message: `Salon ${newActiveStatus ? 'activated' : 'deactivated'} successfully`,
      salon: updatedSalon,
      isActive: newActiveStatus
    });
  } catch (error) {
    console.error("[ADMIN_SALON_TOGGLE_STATUS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
