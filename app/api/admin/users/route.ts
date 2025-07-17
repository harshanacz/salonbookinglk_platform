import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Appointment from "@/models/Appointment";
import Service from "@/models/Service";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  console.log("[USERS_GET] called");
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const id = url.searchParams.get("id");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    // Connect to database
    await dbConnect();
    
    // If ID is provided, fetch a single user
    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }
      return NextResponse.json(user);
    }
    
    // Build query for multiple users
    const query: any = {};
    if (type) {
      query.type = type;
    }
    

    const skip = (page - 1) * limit;

    
    // Count total users for pagination
    const total = await User.countDocuments(query);
      // Fetch users based on query with pagination
    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // For customer users, fetch additional booking information
    const enhancedUsers = await Promise.all(
      users.map(async (user) => {
        // Only calculate booking info for customers
        if (user.type === UserType.CUSTOMER) {
          // Count total bookings
          const totalBookings = await Appointment.countDocuments({
            clientId: user._id
          });
          
          // Calculate total spent by aggregating service prices from appointments
          const spending = await Appointment.aggregate([
            { $match: { clientId: user._id } },
            { $lookup: {
                from: "services",
                localField: "serviceId",
                foreignField: "_id",
                as: "service"
              }
            },
            { $unwind: "$service" },
            { $group: {
                _id: "$clientId",
                totalSpent: { $sum: "$service.price" }
              }
            }
          ]);
          
          const totalSpent = spending.length > 0 ? spending[0].totalSpent : 0;
          
          // Return user with added stats
          return {
            ...user.toObject(),
            totalBookings,
            totalSpent
          };
        }
        
        // For non-customers, just return the user without stats
        return {
          ...user.toObject(),
          totalBookings: 0,
          totalSpent: 0
        };
      })
    );
    
    return NextResponse.json({
      users: enhancedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
