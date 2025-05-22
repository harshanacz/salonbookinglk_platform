import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";
import Service from "@/models/Service"; // Add import for Service model
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  console.log("----- STARTING APPOINTMENTS API ROUTE -----");

  try {
    console.log("[1/8] Checking user authentication...");
    const { userId } = await auth();
    if (!userId) {
      console.warn("⚠️ Unauthorized access attempt - no userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`✅ Authenticated user ID: ${userId}`);

    console.log("[2/8] Connecting to database...");
    await dbConnect();
    console.log("✅ Database connected");

    console.log(
      `[3/8] Fetching user from database for clerkUserId: ${userId}...`
    );
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      console.warn(`⚠️ User not found in database for clerkUserId: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log(`✅ User found: ${user._id}, Type: ${user.type}`);

    console.log("[4/8] Parsing query parameters...");
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log("Query parameters:", {
      status,
      clientId,
      date,
      page,
      limit,
    });

    console.log("[5/8] Building filter object...");
    const filter: any = {};

    if (user.type === UserType.CUSTOMER) {
      console.log("👤 Customer access - filtering by own appointments");
      filter.clientId = user._id;
    } else if ([UserType.ADMIN, UserType.SALON_OWNER].includes(user.type)) {
      console.log("👔 Admin/Salon Owner access - applying filters");
      if (status) filter.status = status;
      if (clientId) filter.clientId = clientId;
    } else {
      console.warn(`❌ Access denied for user type: ${user.type}`);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (date) {
      try {
        console.log(`📅 Applying date filter: ${date}`);
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        filter.date = { $gte: startDate, $lt: endDate };
      } catch (e) {
        console.error("❌ Invalid date format:", e);
        return NextResponse.json(
          { error: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }
    }

    console.log("[6/8] Counting total documents...");
    const total = await Appointment.countDocuments(filter);
    const skip = (page - 1) * limit;

    console.log("[7/8] Fetching appointments with population...");
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

    console.log(`✅ Found ${appointments.length} appointments`);

    const response = {
      data: appointments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    console.log("[8/8] Sending response...");
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("❌ Server Error:", error.message);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    console.log("----- ENDING APPOINTMENTS API ROUTE -----");
  }
}
