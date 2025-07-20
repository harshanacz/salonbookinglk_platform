import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Complaint from "@/models/complaint";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log("[COMPLAINT_TEST] Starting test...");
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[COMPLAINT_TEST] User authenticated:", userId);

    await dbConnect();
    console.log("[COMPLAINT_TEST] Database connected");

    const user = await User.findOne({ clerkUserId: userId });
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("[COMPLAINT_TEST] User authorized:", user.type);

    // Test basic complaint query
    const complaintCount = await Complaint.countDocuments();
    console.log("[COMPLAINT_TEST] Complaint count:", complaintCount);

    const sampleComplaints = await Complaint.find({}).limit(2).lean();
    console.log("[COMPLAINT_TEST] Sample complaints:", sampleComplaints);

    return NextResponse.json({
      success: true,
      message: "Test successful",
      data: {
        complaintCount,
        sampleComplaints,
        userType: user.type
      }
    });

  } catch (error: any) {
    console.error("[COMPLAINT_TEST] Error:", error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
