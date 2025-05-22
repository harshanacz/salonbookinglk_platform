import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UserType } from "@/models/User";
import connectDB from "@/lib/mongodb"; // Import the UserType enum

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    await connectDB();
    const User = (await import("@/models/User")).default;
    const Appointment = (await import("@/models/Appointment")).default;
    const Service = (await import("@/models/Service")).default;
    const Staff = (await import("@/models/Staff")).default;


    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      console.warn("[APPOINTMENTS_API] Authenticated user not found in DB");
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.ADMIN) {
      console.warn("[APPOINTMENTS_API] Forbidden: non-admin user attempted access");
      return new NextResponse("User is not an admin", { status: 403 });
    }

    console.log("[APPOINTMENTS_API] Parsing query parameters...");
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    console.log("[APPOINTMENTS_API] Query parameters:", {
      page,
      limit,
      date,
      status,
      search: search ? "***" : null
    });

    const query: any = {};
    console.log("[APPOINTMENTS_API] Building base query...");

    if (date) {
      console.log("[APPOINTMENTS_API] Processing date filter...");
      try {
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        const endDate = new Date(dateObj);
        endDate.setDate(endDate.getDate() + 1);
        
        query.date = { 
          $gte: dateObj,
          $lt: endDate
        };
        console.log("[APPOINTMENTS_API] Date range set:", { 
          start: dateObj.toISOString(), 
          end: endDate.toISOString() 
        });
      } catch (dateError) {
        console.error("[APPOINTMENTS_API] Error processing date filter:", dateError);
        return new NextResponse("Invalid date format", { status: 400 });
      }
    }

    if (status) {
      console.log("[APPOINTMENTS_API] Adding status filter:", status);
      query.status = status;
    }

    let filteredIds: any[] = [];
    if (search) {
      console.log("[APPOINTMENTS_API] Processing search filter...");
      try {
        console.log("[APPOINTMENTS_API] Fetching initial data for search...");
        const searchResults = await Appointment.find(query)
          .populate("clientId", "userName email phone")
          .populate("salonId", "userName")
          .populate("serviceId", "title price")
          .populate("staffId", "name")
          .sort({ date: -1, time: -1 })
          .lean();

        console.log(`[APPOINTMENTS_API] Found ${searchResults.length} records to search through`);

        filteredIds = searchResults.filter(appt => {
          const clientName = appt.clientId?.userName || '';
          const salonName = appt.salonId?.userName || '';
          const serviceName = appt.serviceId?.title || '';
          const staffName = appt.staffId?.name || '';
          
          const searchRegex = new RegExp(search, 'i');
          return searchRegex.test(clientName) || 
                 searchRegex.test(salonName) || 
                 searchRegex.test(serviceName) || 
                 searchRegex.test(staffName);
        }).map(appt => appt._id);

        console.log(`[APPOINTMENTS_API] Search filtered down to ${filteredIds.length} records`);
        
        if (filteredIds.length > 0) {
          query._id = { $in: filteredIds };
        } else {
          return NextResponse.json({
            appointments: [],
            pagination: {
              total: 0,
              page,
              limit,
              pages: 0,
            },
          });
        }
      } catch (searchError) {
        return new NextResponse("Failed to process search query", { status: 500 });
      }
    }

    let appointments;
    try {
      appointments = await Appointment.find(query)
        .populate({
          path: "clientId",
          select: "userName email phone",
          model: "User"
        })
        .populate({
          path: "salonId",
          select: "userName",
          model: "User"
        })
        .populate({
          path: "serviceId",
          select: "title",
          model: "Service"
        })
        .populate({
          path: "staffId",
          select: "name",
          model: "Staff"
        })
        .sort({ date: -1, time: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      
    } catch (queryError) {
      return new NextResponse("Failed to retrieve appointment data", { status: 500 });
    }


    let total;
    try {
      if (search) {
        total = filteredIds.length;
      } else {
        total = await Appointment.countDocuments(query);
      }
    } catch (countError) {
      return new NextResponse("Failed to count total appointments", { status: 500 });
    }

    // Calculate Pagination
    const pages = Math.ceil(total / limit);
    console.log("[APPOINTMENTS_API] Pagination calculated:", {
      total,
      page,
      limit,
      pages
    });

    return NextResponse.json({
      appointments,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });

  } catch (error) {

    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : {
      message: 'Unknown error occurred'
    };

    return NextResponse.json(
      { 
        error: "Failed to fetch appointments",
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )}
}