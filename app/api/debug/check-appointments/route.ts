import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { AppointmentStatus } from "@/models/enums";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user data
    const user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check for ongoing appointments
    const ongoingAppointments = await Appointment.find({
      $or: [
        { salonId: user._id },
        { userId: user._id }
      ],
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      date: { $gte: new Date() }
    }).populate("clientId", "name phone")
      .populate("serviceId", "name");

    // Check all appointments for this salon
    const allAppointments = await Appointment.find({
      $or: [
        { salonId: user._id },
        { userId: user._id }
      ]
    }).populate("clientId", "name phone")
      .populate("serviceId", "name");

    return NextResponse.json({
      userId: user._id,
      email: user.email,
      isActive: user.isActive,
      deactivatedAt: user.deactivatedAt,
      ongoingAppointmentsCount: ongoingAppointments.length,
      ongoingAppointments: ongoingAppointments.map(apt => ({
        id: apt._id,
        clientName: (apt.clientId && typeof apt.clientId === 'object' && 'name' in apt.clientId) ? (apt.clientId as { name: string }).name : 'Unknown',
        serviceName: (apt.serviceId && typeof apt.serviceId === 'object' && 'name' in apt.serviceId) ? (apt.serviceId as { name: string }).name : 'Unknown',
        date: apt.date,
        status: apt.status
      })),
      totalAppointmentsCount: allAppointments.length,
      canDeactivate: ongoingAppointments.length === 0
    });

  } catch (error) {
    console.error("[DEBUG_APPOINTMENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
