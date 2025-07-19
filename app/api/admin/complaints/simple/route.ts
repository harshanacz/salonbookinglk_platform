import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Complaint from "@/models/complaint";

// Simple GET endpoint for debugging
export async function GET(request: NextRequest) {
  try {
    console.log("[ADMIN_COMPLAINTS_SIMPLE] Starting...");
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("[ADMIN_COMPLAINTS_SIMPLE] User authorized, fetching complaints...");

    // Simple query without population first
    const complaints = await Complaint.find({}).lean();
    console.log(`[ADMIN_COMPLAINTS_SIMPLE] Found ${complaints.length} complaints`);

    if (complaints.length === 0) {
      return NextResponse.json([]);
    }

    // Return simplified data structure
    const simplifiedComplaints = complaints.map((complaint: any) => ({
      id: complaint._id?.toString() || '',
      title: complaint.subject || 'No subject',
      description: complaint.description || 'No description',
      category: complaint.category || 'other',
      status: complaint.status === 'pending' ? 'PENDING' 
              : complaint.status === 'in-progress' ? 'IN_PROGRESS'
              : complaint.status === 'resolved' ? 'RESOLVED'
              : 'CLOSED',
      priority: 'MEDIUM',
      complainant: {
        name: 'User',
        email: 'user@example.com',
        phone: '+1234567890'
      },
      salon: {
        name: 'Salon',
        contact: '+0987654321',
        id: 'salon-001'
      },
      appointment: {
        id: 'appt-001',
        date: new Date().toISOString(),
        time: 1400,
        serviceName: 'Service',
        staffName: 'Staff',
        amount: 5000
      },
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    }));

    console.log(`[ADMIN_COMPLAINTS_SIMPLE] Returning ${simplifiedComplaints.length} simplified complaints`);
    return NextResponse.json(simplifiedComplaints);

  } catch (error: any) {
    console.error("[ADMIN_COMPLAINTS_SIMPLE] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch complaints", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
