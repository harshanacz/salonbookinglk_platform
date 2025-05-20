import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Service from "@/models/Service";
import Staff from "@/models/Staff";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    // Find the service
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Find all active staff members for the salon
    const staffMembers = await Staff.find({
      userId: service.userId,
      status: "Active",
    }).select("_id name email profileImage role");

    return NextResponse.json(
      {
        staff: staffMembers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching staff members:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff members" },
      { status: 500 }
    );
  }
}
