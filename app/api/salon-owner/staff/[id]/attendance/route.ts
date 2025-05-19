import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Staff from "@/models/Staff";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to database
    await dbConnect();
    
    // Get user and verify permissions
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    // Get request data
    const { id } = params;
    const { date, timeSlot, status } = await request.json();

    // Validate required fields
    if (!date || !timeSlot || !status) {
      return new NextResponse(
        JSON.stringify({
          message: "Missing required fields",
          receivedData: { date, timeSlot, status }
        }), 
        { status: 400 }
      );
    }

    // Update staff member
    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        $set: { status },
        $push: {
          attendance: {
            date,
            timeSlot,
            status,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedStaff) {
      return new NextResponse("Staff member not found", { status: 404 });
    }

    return NextResponse.json(updatedStaff);

  } catch (error: any) {
    console.error("[STAFF_ATTENDANCE_PUT]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: error.message || "Internal Error",
        error: error.toString()
      }), 
      { status: 500 }
    );
  }
}
