import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Staff from "@/models/Staff";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ message: "Salon ID is required" }),
        { status: 400 }
      );
    }

    await dbConnect();

    // Find all active staff members for this salon
    const staff = await Staff.find({
      userId: userId,
      status: 'Active'
    }).select('_id name role profileImage');

    return NextResponse.json(staff);

  } catch (error: any) {
    console.error("[STAFF_SALON_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: error.message || "Internal Error",
        error: error.toString()
      }), 
      { status: 500 }
    );
  }
} 