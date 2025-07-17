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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    
    const user = await User.findOne({ clerkUserId });
    if (!user || user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const { date, timeSlot, status } = await request.json();

    if (!date || !timeSlot || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Update attendance for specific date
    const updatedStaff = await Staff.findOneAndUpdate(
      { 
        _id: id,
        userId: user._id,
        'attendance.date': { $ne: date } // Prevent duplicate dates
      },
      {
        $push: {
          attendance: {
            date,
            timeSlot,
            status,
            updatedAt: new Date()
          }
        },
        ...(new Date(date).toDateString() === new Date().toDateString() && {
          $set: { status }
        })
      },
      { new: true }
    );

    if (!updatedStaff) {
      return new NextResponse("Staff member not found", { status: 404 });
    }

    return NextResponse.json(updatedStaff);

  } catch (error: any) {
    console.error("[STAFF_ATTENDANCE_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
