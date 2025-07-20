import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";
import AppointmentModel from "@/models/Appointment";
import { AppointmentStatus } from "@/models/enums";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    console.log("[DEACTIVATE_API] User ID:", userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { email, confirmation } = await request.json();
    
    console.log("[DEACTIVATE_API] Request data:", { email, confirmation });

    // Validate inputs
    if (!email || confirmation !== "DEACTIVATE") {
      return NextResponse.json(
        { error: "Please fill all fields correctly and type 'DEACTIVATE' to confirm" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get user data
    const user = await User.findOne({ clerkUserId: userId });
    console.log("[DEACTIVATE_API] User found:", !!user, user?.email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify email matches
    if (user.email !== email) {
      console.log("[DEACTIVATE_API] Email mismatch:", user.email, "vs", email);
      return NextResponse.json(
        { error: "Email does not match your account" },
        { status: 400 }
      );
    }

    // Find salon context to verify salon owner
    const salonContext = await SalonContext.findOne({ userId: user._id });
    console.log("[DEACTIVATE_API] Salon context found:", !!salonContext);
    
    if (!salonContext) {
      return NextResponse.json(
        { error: "Salon profile not found" },
        { status: 404 }
      );
    }

    // Check for ongoing appointments before deactivation
    const ongoingAppointments = await AppointmentModel.find({
      $or: [
        { salonId: user._id },
        { userId: user._id }  // In case some old appointments use this field
      ],
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      date: { $gte: new Date() } // Only check future appointments
    });

    console.log("[DEACTIVATE_API] Ongoing appointments found:", ongoingAppointments.length);

    if (ongoingAppointments.length > 0) {
      return NextResponse.json(
        { 
          error: `You can't deactivate if you have ongoing appointments. Please complete or cancel your ${ongoingAppointments.length} pending appointments first.`,
          ongoingAppointmentsCount: ongoingAppointments.length
        },
        { status: 400 }
      );
    }

    // Deactivate the user account (this affects all salon operations)
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      isActive: false,
      deactivatedAt: new Date(),
    }, { new: true });

    console.log("[DEACTIVATE_API] User deactivated:", updatedUser?.isActive, updatedUser?.deactivatedAt);

    return NextResponse.json({
      message: "Account deactivated successfully. You have 30 days to reactivate by logging back in.",
      deactivatedAt: new Date(),
    });

  } catch (error) {
    console.error("[SALON_DEACTIVATE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
