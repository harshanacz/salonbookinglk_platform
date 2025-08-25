import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { AppointmentStatus } from "@/models/enums";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { email, confirmationText } = body;

    // Validate input
    if (!email || !confirmationText) {
      return NextResponse.json(
        { error: "Email and confirmation text are required" },
        { status: 400 }
      );
    }

    if (confirmationText !== "CONFIRM DEACTIVATION") {
      return NextResponse.json(
        { error: "Invalid confirmation text" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the user
    console.log("Looking for user with clerkUserId:", clerkUserId);
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      console.log("User not found for clerkUserId:", clerkUserId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("User found:", user._id, "Email:", user.email, "isActive:", user.isActive);

    // Verify email matches
    if (user.email !== email) {
      return NextResponse.json(
        { error: "Email does not match your account" },
        { status: 400 }
      );
    }

    // Check if user is already deactivated
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is already deactivated" },
        { status: 400 }
      );
    }

    // Check for upcoming appointments
    const currentDate = new Date();
    const upcomingAppointments = await Appointment.find({
      clientId: user._id,
      date: { $gte: currentDate },
      status: { 
        $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] 
      },
    });

    if (upcomingAppointments.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot deactivate account with upcoming appointments",
          upcomingAppointments: upcomingAppointments.length,
        },
        { status: 400 }
      );
    }

    // Deactivate the user account
    console.log("Deactivating user:", user._id, "Current isActive:", user.isActive);
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();
    console.log("User deactivated successfully:", user._id, "New isActive:", user.isActive);

    return NextResponse.json({
      message: "Account deactivated successfully",
      deactivatedAt: user.deactivatedAt,
    });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
