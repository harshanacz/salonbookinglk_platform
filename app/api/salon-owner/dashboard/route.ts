import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service, { ServiceStatus } from "@/models/Service";
import Staff from "@/models/Staff";

// Add runtime configuration
export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    // Fetch services count using proper enum values
    const activeServices = await Service.countDocuments({
      userId: user._id,
      status: ServiceStatus.ACTIVE,
    });

    const pendingServices = await Service.countDocuments({
      userId: user._id,
      status: ServiceStatus.PENDING,
    });

    // Fetch staff count
    const totalStaff = await Staff.countDocuments({ userId: user._id });
    const newStaffThisMonth = await Staff.countDocuments({
      userId: user._id,
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    });

    return NextResponse.json({
      services: {
        active: activeServices,
        pending: pendingServices,
      },
      staff: {
        total: totalStaff,
        newThisMonth: newStaffThisMonth,
      },
    });
    
  } catch (error: any) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: error.message || "Internal Error",
        error: error.toString()
      }), 
      { status: 500 }
    );
  }
}
