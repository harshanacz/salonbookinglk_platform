import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { AppointmentStatus } from "@/models/enums";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { email, confirmationText } = body;

    // Find the user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already deactivated
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is already deactivated" }, { status: 400 });
    }

    // Verify email matches (basic validation - in production you might want more secure verification)
    if (user.email !== email) {
      return NextResponse.json({ error: "Email does not match" }, { status: 400 });
    }

    // Verify confirmation text
    if (confirmationText !== "DEACTIVATE") {
      return NextResponse.json({ error: "Please type 'DEACTIVATE' to confirm" }, { status: 400 });
    }

    // Check for upcoming appointments
    const currentDate = new Date();
    const upcomingAppointments = await Appointment.find({
      clientId: user._id,
      date: { $gte: currentDate },
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
    });

    if (upcomingAppointments.length > 0) {
      return NextResponse.json({
        error: "Cannot deactivate account with upcoming appointments",
        upcomingAppointments: upcomingAppointments.length
      }, { status: 400 });
    }

    // Deactivate the user account
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    console.log(`[USER_DEACTIVATE] User account deactivated: ${user.email || user.userName}`);

    return NextResponse.json({
      message: "Account deactivated successfully",
      reactivationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

  } catch (error) {
    console.error("[USER_DEACTIVATE] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
