import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";
import Service from "@/models/Service";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const appointment = await Appointment.findById(params.id)
      .populate({
        path: "clientId",
        select: "userName email phone",
        model: User,
        options: { strictPopulate: false },
      })
      .populate({
        path: "serviceId",
        select: "title userId price",
        model: Service,
        options: { strictPopulate: false },
        populate: [
          {
            path: "userId",
            model: User,
            select: "_id",
            options: { strictPopulate: false },
            populate: {
              path: "salonContext",
              model: SalonContext,
              select: "businessName",
              options: { strictPopulate: false },
            },
          },
        ],
      })
      .populate({
        path: "staffId",
        select: "name",
        options: { strictPopulate: false },
      })
      .populate({
        path: "salonContextId",
        model: SalonContext,
        select: "businessName",
        options: { strictPopulate: false },
      });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Customer access control
    if (
      user.type === UserType.CUSTOMER &&
      appointment.clientId?._id.toString() !== user._id.toString()
    ) {
      return NextResponse.json(
        { error: "Access denied - not your appointment" },
        { status: 403 }
      );
    }

    const responseAppointment = appointment.toObject();

    // Determine business name
    if (
      appointment.salonContextId &&
      appointment.salonContextId.businessName
    ) {
      responseAppointment.businessName =
        appointment.salonContextId.businessName;
    } else {
      const serviceProvider = appointment.serviceId?.userId;
      responseAppointment.businessName =
        serviceProvider?.salonContext?.businessName || null;
    }

    return NextResponse.json(responseAppointment);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
