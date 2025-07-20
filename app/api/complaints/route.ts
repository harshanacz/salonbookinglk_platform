import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Complaint from "@/models/complaint";

export async function POST(req: Request) {
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

    const body = await req.json();
    console.log("Received complaint body:", body);

    const { appointmentId, category, subject, description } = body;

    // Validate required fields
    if (!appointmentId || !category || !subject || !description) {
      return new NextResponse(
        JSON.stringify({
          message: "Missing required fields",
          receivedData: { appointmentId, category, subject, description },
        }),
        { status: 400 }
      );
    }

    // Create new complaint
    const newComplaint = await Complaint.create({
      appointmentId,
      userId: user._id,
      category,
      subject,
      description,
    });

    console.log("Created complaint:", newComplaint);

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (error: any) {
    console.error("[COMPLAINT_POST]", error);
    return new NextResponse(
      JSON.stringify({
        message: error.message || "Internal Error",
        error: error.toString(),
      }),
      { status: 500 }
    );
  }
}

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

    const complaints = await Complaint.find({
      userId: user._id,
    })
      .populate("appointmentId", "date time")
      .sort({ createdAt: -1 });

    return NextResponse.json(complaints);
  } catch (error: any) {
    console.error("[COMPLAINT_GET]", error);
    return new NextResponse(
      JSON.stringify({
        message: error.message || "Internal Error",
        error: error.toString(),
      }),
      { status: 500 }
    );
  }
}
