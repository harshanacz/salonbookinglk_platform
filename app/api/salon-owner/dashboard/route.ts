import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service, { ServiceStatus } from "@/models/Service";
import Staff from "@/models/Staff";
import Appointment from "@/models/Appointment";

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

    // Add this new section to fetch appointment counts
    const totalAppointments = await Appointment.countDocuments({
      salonId: user._id
    });

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthAppointments = await Appointment.countDocuments({
      salonId: user._id,
      createdAt: { $gte: lastMonthDate }
    });

    // Get today's start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's created appointments (modified query)
    const todayAppointments = await Appointment.find({
      salonId: user._id,
      createdAt: {  // Changed from 'date' to 'createdAt'
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('clientId', 'name')
    .populate('serviceId', 'name')
    .sort({ createdAt: -1 }) // Sort by creation time, newest first
    .lean();

    // Get popular services for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popularServices = await Appointment.aggregate([
      {
        $match: {
          salonId: user._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: "$serviceId",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service"
        }
      },
      {
        $unwind: "$service"
      },
      {
        $project: {
          name: "$service.type", // Changed from "$service.name" to "$service.type"
          count: 1,
          trend: {
            $concat: [
              "+",
              {
                $toString: {
                  $round: [
                    { $multiply: [{ $divide: ["$count", totalAppointments] }, 100] },
                    0
                  ]
                }
              },
              "%"
            ]
          }
        }
      }
    ]);

    // Get weekly appointments data
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyAppointments = await Appointment.aggregate([
      {
        $match: {
          salonId: user._id,
          createdAt: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Convert to array of counts for each day
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = new Date().getDay();
    const weeklyData = {
      labels: daysOfWeek.slice(0, todayIndex + 1),
      counts: new Array(7).fill(0)
    };

    weeklyAppointments.forEach((day) => {
      weeklyData.counts[day._id - 1] = day.count;
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
      appointments: {
        total: totalAppointments,
        lastMonth: lastMonthAppointments,
        today: todayAppointments
      },
      popularServices,
      weeklyData: {
        labels: weeklyData.labels,
        counts: weeklyData.counts.slice(0, todayIndex + 1)
      }
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
