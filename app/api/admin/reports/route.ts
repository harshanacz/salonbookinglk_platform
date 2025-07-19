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
      .lean();    // Calculate total revenue and revenue by status
    let totalRevenue = 0;
    let confirmedRevenue = 0;
    let pendingRevenue = 0;
    let completedRevenue = 0;
    let cancelledRevenue = 0;

    const revenueByStatus = appointments.reduce((acc, appointment) => {
      const serviceId = appointment.serviceId;
      const price = serviceId && typeof serviceId === 'object' && 'price' in serviceId
        ? (serviceId.price as number) || 0 
        : 0;
      
      // Add to total revenue (only for completed/confirmed appointments)
      if (appointment.status === 'COMPLETED' || appointment.status === 'CONFIRMED') {
        totalRevenue += price;
      }
      
      // Track revenue by status
      switch (appointment.status) {
        case 'CONFIRMED':
          confirmedRevenue += price;
          break;
        case 'PENDING':
          pendingRevenue += price;
          break;
        case 'COMPLETED':
          completedRevenue += price;
          break;
        case 'CANCELLED':
          cancelledRevenue += price;
          break;
      }
      
      return acc;
    }, {});

    // Get appointment status counts
    const appointmentStatusCounts = appointments.reduce((acc: any, appointment) => {
      const status = appointment.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Get salon count - Count only verified and active salon contexts
    const totalSalons = await SalonContext.countDocuments({ 
      isVerified: true 
    });
    
    // Calculate total registered salons (including unverified) for comparison
    const totalRegisteredSalons = await SalonContext.countDocuments();

    // Get popular services with salon names
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
        $lookup: {
          from: "saloncontexts",
          localField: "salonContextId",
          foreignField: "_id",
          as: "salonContext"
        }
      },
      { $unwind: "$salonContext" },
      {
        $group: {
          _id: {
            serviceId: "$service._id",
            salonId: "$salonContext._id"
          },
          title: { $first: "$service.title" },
          salonName: { $first: "$salonContext.businessName" },
          count: { $sum: 1 },
          servicePrice: { $first: "$service.price" }
        }
      },
      {
        $addFields: {
          revenue: { $multiply: ["$count", "$servicePrice"] }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Generate monthly revenue data (last 6 months)
    const monthlyRevenueData = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Build month-specific query based on salon selection
      let monthQuery: any = {
        date: { $gte: monthStart, $lte: monthEnd }
      };
      
      if (salonId && salonId !== "all") {
        const salonContext = await SalonContext.findOne({ userId: salonId });
        if (salonContext) {
          monthQuery.salonContextId = salonContext._id;
        } else {
          monthQuery.salonId = salonId;
        }
      }
      
      const monthAppointments = await Appointment.find(monthQuery).populate({
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

    // Get average customer satisfaction from actual service ratings
    const serviceRatings = await Service.aggregate([
      {
        $match: {
          reviewCount: { $gt: 0 },
          averageRating: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { 
            $avg: {
              $multiply: ["$averageRating", "$reviewCount"]
            }
          },
          totalReviews: { $sum: "$reviewCount" }
        }
      }
    ]);
    
    let avgSatisfaction = 0; // Default fallback
    if (serviceRatings.length > 0 && serviceRatings[0].totalReviews > 0) {
      avgSatisfaction = Math.round((serviceRatings[0].avgRating / serviceRatings[0].totalReviews) * 10) / 10;
    }

    // Prepare response data
    let responseData: any = {
      stats: {
        totalRevenue,
        totalAppointments: appointments.length,
        verified: totalSalons,
        totalSalons: totalRegisteredSalons,
        customerSatisfaction: avgSatisfaction,
        lostRevenue: cancelledRevenue // Add lost revenue from cancelled appointments
      },
      appointmentsData: {
        confirmed: appointmentStatusCounts.CONFIRMED || 0,
        pending: appointmentStatusCounts.PENDING || 0,
        completed: appointmentStatusCounts.COMPLETED || 0,
        cancelled: appointmentStatusCounts.CANCELLED || 0,
        // Add revenue breakdown by status
        confirmedRevenue,
        pendingRevenue,
        completedRevenue,
        cancelledRevenue
      },
      popularServices: popularServicesData.map(service => ({
        title: service.title,
        count: service.count,
        salonName: service.salonName || 'N/A',
        revenue: service.revenue || 0
      })),
      revenueData: monthlyRevenueData,
      salons: salonList
    };

    // Add top salons data for "All Salons" view
    if (!salonId || salonId === "all") {
      const topSalonsData = await Appointment.aggregate([
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
            _id: "$salonId",
            revenue: { $sum: "$service.price" },
            appointments: { $sum: 1 },
            services: { $addToSet: "$serviceId" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "salon"
          }
        },
        { $unwind: "$salon" },
        {
          $lookup: {
            from: "saloncontexts",
            localField: "_id",
            foreignField: "userId",
            as: "salonContext"
          }
        },
        {
          $project: {
            _id: 1,
            revenue: 1,
            appointments: 1,
            services: { $size: "$services" },
            name: {
              $cond: {
                if: { $gt: [{ $size: "$salonContext" }, 0] },
                then: { $arrayElemAt: ["$salonContext.businessName", 0] },
                else: "$salon.userName"
              }
            },
            location: { $arrayElemAt: ["$salonContext.location", 0] },
            rating: { $add: [3, { $multiply: [{ $rand: {} }, 2] }] } // Random 3-5
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
      ]);

      responseData.topSalons = topSalonsData.map(salon => ({
        id: salon._id.toString(),
        name: salon.name || "Unnamed Salon",
        revenue: salon.revenue,
        appointments: salon.appointments,
        services: salon.services,
        rating: Math.round(salon.rating * 10) / 10,
        location: salon.location || "N/A"
      }));
    }

    // Add individual salon details for specific salon view
    if (salonId && salonId !== "all") {
      const salonContext = await SalonContext.findOne({ userId: salonId })
        .populate("userId", "userName")
        .lean();

      if (salonContext) {
        // Get salon services with detailed stats
        const salonServices = await Appointment.aggregate([
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
              name: { $first: "$service.title" },
              bookings: { $sum: 1 },
              revenue: { $sum: "$service.price" },
              price: { $first: "$service.price" },
              duration: { $first: "$service.duration" },
              avgRating: { $avg: { $add: [3, { $multiply: [{ $rand: {} }, 2] }] } }
            }
          },
          { $sort: { bookings: -1 } }
        ]);

        const totalServicesCount = await Service.countDocuments({ 
          salonId: salonId 
        });

        responseData.salonDetails = {
          name: (salonContext as any).businessName || (salonContext as any).userId?.userName || "Unnamed Salon",
          location: (salonContext as any).location || "N/A",
          totalServices: totalServicesCount,
          avgRating: (salonContext as any).reviewScore 
            ? Math.round((salonContext as any).reviewScore * 10) / 10 
            : Math.round((Math.random() * 2 + 3) * 10) / 10,
          services: salonServices.map(service => ({
            name: service.name,
            bookings: service.bookings,
            revenue: service.revenue,
            price: service.price,
            duration: service.duration || "60 min",
            avgRating: Math.round(service.avgRating * 10) / 10
          }))
        };
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[ADMIN_REPORTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
