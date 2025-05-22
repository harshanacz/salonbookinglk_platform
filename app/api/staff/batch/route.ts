import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Staff from "@/models/Staff";

export async function POST(req: Request) {
  try {
    const { staffIds } = await req.json();

    if (!staffIds || !Array.isArray(staffIds)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid staff IDs provided" }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch only active staff members
    const staff = await Staff.find({
      _id: { $in: staffIds },
      status: 'Active'
    }).select('_id name role profileImage');

    return NextResponse.json(staff);

  } catch (error: any) {
    console.error("[STAFF_BATCH_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: error.message || "Internal Error",
        error: error.toString()
      }), 
      { status: 500 }
    );
  }
} 