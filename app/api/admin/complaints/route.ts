import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

// Get all complaints
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // For now, return mock data since complaint model doesn't exist yet
    const mockComplaints = [
      {
        id: "comp001",
        title: "Poor Service Quality",
        description: "The staff was unprofessional and the service was below expectations.",
        status: "PENDING",
        priority: "HIGH",
        complainant: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1234567890"
        },
        salon: {
          name: "Elegant Salon",
          id: "salon123"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json(mockComplaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

// Update complaint status
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.type)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { complaintId, status, adminNotes } = await request.json();

    if (!complaintId || !status) {
      return NextResponse.json(
        { error: "Complaint ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Mock complaint update (replace with actual complaint model logic)
    const previousStatus = "PENDING"; // This would come from the database
    const complaintTitle = "Poor Service Quality"; // This would come from the database

    // Log admin activity
    try {
      const adminInfo = await getAdminInfo();
      if (adminInfo) {
        logAdminActivity({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          adminEmail: adminInfo.adminEmail,
          action: AdminActionType.COMPLAINT_MANAGEMENT,
          target: complaintId,
          details: `Changed complaint "${complaintTitle}" status from ${previousStatus} to ${status}`,
          metadata: {
            complaintId,
            complaintTitle,
            previousStatus,
            newStatus: status,
            adminNotes: adminNotes || null,
            actionType: 'status_change'
          }
        });
      }
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Complaint ${status.toLowerCase().replace('_', ' ')} successfully` 
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    return NextResponse.json(
      { error: "Failed to update complaint" },
      { status: 500 }
    );
  }
}
