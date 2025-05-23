import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";
import Service from "@/models/Service";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Database connection
    await dbConnect();

    // User verification
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build filter
    const filter: any = {};

    if (user.type === UserType.CUSTOMER) {
      filter.clientId = user._id;
    } else if ([UserType.ADMIN, UserType.SALON_OWNER].includes(user.type)) {
      if (status) filter.status = status;
      if (clientId) filter.clientId = clientId;
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Date filter
    if (date) {
      try {
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.date = { $gte: startDate, $lt: endDate };
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
    }

    // Pagination
    const total = await Appointment.countDocuments(filter);
    const skip = (page - 1) * limit;

    // Fetch appointments
    const appointments = await Appointment.find(filter)
      .populate({
        path: "clientId",
        select: "userName email phone",
        options: { strictPopulate: false },
      })
      .populate({
        path: "serviceId",
        select: "title userId",
        model: Service,
        options: { strictPopulate: false },
        populate: {
          path: "userId",
          select: "businessName",
          model: SalonContext,
          options: { strictPopulate: false },
        }
      })
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Response
    return NextResponse.json({
      data: appointments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Appointments API Error:', errorMessage);
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}