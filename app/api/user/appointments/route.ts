import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { AppointmentStatus } from "@/models/enums";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentDate = new Date();

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      clientId: user._id,
      date: { $gte: currentDate },
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] }
    })
    .populate('serviceId', 'name price duration images')
    .populate('salonId', 'userName')
    .populate('salonContextId', 'businessName profilePictureUrl')
    .sort({ date: 1, time: 1 });

    // Get past appointments
    const pastAppointments = await Appointment.find({
      clientId: user._id,
      $or: [
        { date: { $lt: currentDate } },
        { 
          date: { $gte: currentDate },
          status: { $in: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED] }
        }
      ]
    })
    .populate('serviceId', 'name price duration images')
    .populate('salonId', 'userName') 
    .populate('salonContextId', 'businessName profilePictureUrl')
    .sort({ date: -1, time: -1 })
    .limit(10);

    // Transform upcoming appointments
    const transformedUpcoming = upcomingAppointments.map((appointment: any) => ({
      id: appointment._id.toString(),
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      service: {
        id: (appointment.serviceId as any)._id.toString(),
        name: (appointment.serviceId as any).name,
        price: (appointment.serviceId as any).price,
        duration: (appointment.serviceId as any).duration,
        image: (appointment.serviceId as any).images && (appointment.serviceId as any).images.length > 0 
          ? (appointment.serviceId as any).images[0] 
          : "/placeholder.svg"
      },
      salon: {
        id: appointment.salonId ? (appointment.salonId as any)._id.toString() : null,
        name: appointment.salonContextId && (appointment.salonContextId as any).businessName
          ? (appointment.salonContextId as any).businessName
          : (appointment.salonId && (appointment.salonId as any).userName ? (appointment.salonId as any).userName : "Unknown Salon"),
        image: appointment.salonContextId && (appointment.salonContextId as any).profilePictureUrl
          ? (appointment.salonContextId as any).profilePictureUrl
          : "/placeholder-logo.svg"
      },
      note: appointment.note || "",
      paymentMethod: appointment.paymentMethod || ""
    }));

    // Transform past appointments
    const transformedPast = pastAppointments.map((appointment: any) => ({
      id: appointment._id.toString(),
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      service: {
        id: (appointment.serviceId as any)._id.toString(),
        name: (appointment.serviceId as any).name,
        price: (appointment.serviceId as any).price,
        duration: (appointment.serviceId as any).duration,
        image: (appointment.serviceId as any).images && (appointment.serviceId as any).images.length > 0 
          ? (appointment.serviceId as any).images[0] 
          : "/placeholder.svg"
      },
      salon: {
        id: appointment.salonId ? (appointment.salonId as any)._id.toString() : null,
        name: appointment.salonContextId && (appointment.salonContextId as any).businessName
          ? (appointment.salonContextId as any).businessName 
          : (appointment.salonId && (appointment.salonId as any).userName ? (appointment.salonId as any).userName : "Unknown Salon"),
        image: appointment.salonContextId && (appointment.salonContextId as any).profilePictureUrl 
          ? (appointment.salonContextId as any).profilePictureUrl 
          : "/placeholder-logo.svg"
      },
      note: appointment.note || "",
      paymentMethod: appointment.paymentMethod || ""
    }));

    return NextResponse.json({
      upcoming: transformedUpcoming,
      past: transformedPast,
      user: {
        name: user.userName || "User",
        email: user.email
      }
    });

  } catch (error) {
    console.error("[USER_APPOINTMENTS] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
