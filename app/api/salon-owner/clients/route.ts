import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Appointment from "@/models/Appointment";
import User, { UserType } from "@/models/User";
import dbConnect from "@/lib/mongodb";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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

    // Get unique clients from appointments with proper error handling
    try {
      const clientsData = await Appointment.aggregate([
        { $match: { salonId: user._id } },
        {
          $group: {
            _id: "$clientId",
            lastVisit: { $max: "$date" },
            totalSpent: { $sum: "$amount" },
            totalAppointments: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "clientInfo"
          }
        },
        { $unwind: "$clientInfo" },
        {
          $project: {
            id: "$_id",
            name: "$clientInfo.userName",
            email: "$clientInfo.email",
            phone: "$clientInfo.mobileNumber",
            lastVisit: 1,
            totalSpent: 1,
            totalAppointments: 1,
            avatar: "$clientInfo.profileImage"
          }
        }
      ]);

      console.log("Fetched clients:", clientsData.length); // Debug log
      return NextResponse.json(clientsData);

    } catch (aggregateError) {
      console.error("[CLIENTS_AGGREGATE]", aggregateError);
      return new NextResponse(
        JSON.stringify({
          message: "Error fetching client data",
          error: aggregateError instanceof Error ? aggregateError.message : String(aggregateError)
        }),
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("[CLIENTS_GET]", error);
    return new NextResponse(
      JSON.stringify({
        message: error.message || "Internal Error",
        error: error.toString()
      }),
      { status: 500 }
    );
  }
}
