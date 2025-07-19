import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Complaint from "@/models/complaint";
import Appointment from "@/models/Appointment";
import SalonContext from "@/models/SalonContext";

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

    // Fetch complaints with proper population
    const complaints = await Complaint.find({})
      .populate({
        path: 'userId',
        select: 'userName email phone mobileNumber'
      })
      .populate({
        path: 'appointmentId',
        select: 'date time salonId salonContextId serviceId staffId totalAmount',
        populate: [
          {
            path: 'serviceId',
            select: 'name title'
          },
          {
            path: 'staffId',
            select: 'name'
          },
          {
            path: 'salonContextId',
            select: 'businessName contactNumber'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();
      
    console.log(`[ADMIN_COMPLAINTS_SIMPLE] Found ${complaints.length} complaints`);

    if (complaints.length === 0) {
      return NextResponse.json([]);
    }

    // Return properly populated data structure
    const simplifiedComplaints = await Promise.all(
      complaints.map(async (complaint: any) => {
        let salonData: any = null;
        let userName = 'Unknown User';
        let userEmail = 'No email provided';
        let userPhone = 'No phone provided';
        
        // Extract user information
        if (complaint.userId) {
          userName = complaint.userId.userName || 'Unknown User';
          userEmail = complaint.userId.email || 'No email provided';
          userPhone = complaint.userId.phone || complaint.userId.mobileNumber || 'No phone provided';
        }
        
        // Extract salon information from the populated salonContextId
        if (complaint.appointmentId?.salonContextId) {
          salonData = complaint.appointmentId.salonContextId;
        } else if (complaint.appointmentId) {
          // Fallback: try to fetch salon data if salonContextId wasn't populated
          if (complaint.appointmentId.salonContextId && typeof complaint.appointmentId.salonContextId === 'string') {
            try {
              salonData = await SalonContext.findById(complaint.appointmentId.salonContextId)
                .select('businessName contactNumber')
                .lean();
            } catch (error) {
              console.log(`[ADMIN_COMPLAINTS_SIMPLE] Error fetching salon context by ID:`, error);
            }
          } else if (complaint.appointmentId.salonId) {
            try {
              // Fallback: try to find salon context by userId (salonId)
              salonData = await SalonContext.findOne({ userId: complaint.appointmentId.salonId })
                .select('businessName contactNumber')
                .lean();
            } catch (error) {
              console.log(`[ADMIN_COMPLAINTS_SIMPLE] Error fetching salon context by userId:`, error);
            }
          }
        }

        return {
          id: complaint._id?.toString() || '',
          title: complaint.subject || 'No subject',
          description: complaint.description || 'No description',
          category: complaint.category || 'other',
          status: complaint.status === 'pending' ? 'PENDING' 
                  : complaint.status === 'in-progress' ? 'IN_PROGRESS'
                  : complaint.status === 'resolved' ? 'RESOLVED'
                  : 'CLOSED',
          priority: complaint.priority || 'MEDIUM',
          complainant: {
            name: userName,
            email: userEmail,
            phone: userPhone
          },
          salon: {
            name: salonData?.businessName || 'Unknown Salon',
            contact: salonData?.contactNumber || 'No contact provided',
            id: complaint.appointmentId?.salonId?.toString() || complaint.appointmentId?.salonContextId?.toString() || null
          },
          appointment: {
            id: complaint.appointmentId?._id?.toString() || null,
            date: complaint.appointmentId?.date || new Date().toISOString(),
            time: complaint.appointmentId?.time || 1400,
            serviceName: complaint.appointmentId?.serviceId?.name || complaint.appointmentId?.serviceId?.title || 'Unknown Service',
            staffName: complaint.appointmentId?.staffId?.name || 'No staff assigned',
            amount: complaint.appointmentId?.totalAmount || 0
          },
          createdAt: complaint.createdAt,
          updatedAt: complaint.updatedAt
        };
      })
    );

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
