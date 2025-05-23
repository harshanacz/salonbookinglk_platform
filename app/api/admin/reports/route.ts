import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";
import SalonContext from "@/models/SalonContext";
import { subDays, format, startOfMonth, endOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    if (user.type !== UserType.ADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const fromDateParam = searchParams.get("from");
    const toDateParam = searchParams.get("to");
    const salonId = searchParams.get("salonId");

    // Default date range is last 30 days
    const fromDate = fromDateParam ? new Date(fromDateParam) : subDays(new Date(), 30);
    const toDate = toDateParam ? new Date(toDateParam) : new Date();
    
    // Set time to start and end of day
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    // Build base query for appointments
    let appointmentQuery: any = {
      date: { $gte: fromDate, $lte: toDate }
    };

    // Add salon filter if provided
    if (salonId && salonId !== "all") {
      // Find the SalonContext
      const salonContext = await SalonContext.findOne({ userId: salonId });
      if (salonContext) {
        appointmentQuery.salonContextId = salonContext._id;
      } else {
        appointmentQuery.salonId = salonId;
      }
    }

    // Get appointments for the period
    const appointments = await Appointment.find(appointmentQuery)
      .populate({
        path: "serviceId",
        select: "title price type",
        model: Service
      })
      .populate({
        path: "salonId",
        select: "userName",
        model: User
      })
      .lean();    // Calculate total revenue
    const totalRevenue = appointments.reduce((sum, appointment) => {
      const serviceId = appointment.serviceId;
      const price = serviceId && typeof serviceId === 'object' && 'price' in serviceId
        ? (serviceId.price as number) || 0 
        : 0;
      return sum + price;
    }, 0);

    // Get appointment status counts
    const appointmentStatusCounts = appointments.reduce((acc: any, appointment) => {
      const status = appointment.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Get salon count
    const totalSalons = await User.countDocuments({ type: UserType.SALON_OWNER });
    const lastMonthStart = startOfMonth(subDays(new Date(), 30));
    const newSalonsThisMonth = await User.countDocuments({ 
      type: UserType.SALON_OWNER,
      createdAt: { $gte: lastMonthStart }
    });

    // Get popular services
    const popularServicesData = await Appointment.aggregate([
      { $match: appointmentQuery },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: "$service" },
      {
        $group: {
          _id: "$service._id",
          title: { $first: "$service.title" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Generate monthly revenue data (last 6 months)
    const monthlyRevenueData = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
        const monthAppointments = await Appointment.find({
        date: { $gte: monthStart, $lte: monthEnd },
        ...(salonId && salonId !== "all" ? { salonId } : {})
      }).populate({
        path: "serviceId",
        select: "price",
        model: Service
      }).lean();
        const monthRevenue = monthAppointments.reduce((sum, appointment) => {
        // Handle both populated serviceId object and direct price access
        const serviceId = appointment.serviceId;
        const price = serviceId && typeof serviceId === 'object' && 'price' in serviceId
          ? (serviceId.price as number) || 0 
          : 0;
        return sum + price;
      }, 0);
      
      monthlyRevenueData.push({
        month: format(monthDate, "MMM"),
        revenue: monthRevenue
      });
    }

    // Get salon list for dropdown
    const salons = await SalonContext.find()
      .populate({
        path: "userId",
        model: User,
        select: "userName"
      })
      .select("businessName userId")
      .lean();

    const salonList = salons.map((salon: any) => ({
      id: salon.userId._id,
      name: salon.businessName || salon.userId.userName || "Unnamed Salon"
    }));

    // Get average customer satisfaction
    const avgSatisfaction = 4.8; // Placeholder, replace with actual calculation

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalAppointments: appointments.length,
        activeSalons: totalSalons,
        newSalonsThisMonth,
        customerSatisfaction: avgSatisfaction
      },
      appointmentsData: {
        confirmed: appointmentStatusCounts.CONFIRMED || 0,
        pending: appointmentStatusCounts.PENDING || 0,
        completed: appointmentStatusCounts.COMPLETED || 0,
        cancelled: appointmentStatusCounts.CANCELLED || 0
      },
      popularServices: popularServicesData.map(service => ({
        title: service.title,
        count: service.count
      })),
      revenueData: monthlyRevenueData,
      salons: salonList
    });
  } catch (error) {
    console.error("[ADMIN_REPORTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
