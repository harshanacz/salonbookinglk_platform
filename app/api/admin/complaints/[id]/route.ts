import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Complaint from "@/models/complaint";
import Appointment from "@/models/Appointment";
import SalonContext from "@/models/SalonContext";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const complaintId = params.id;

    // Fetch complaint with full population
    const complaint = await Complaint.findById(complaintId)
      .populate({
        path: 'userId',
        select: 'userName email phone mobileNumber'
      })
      .populate({
        path: 'appointmentId',
        select: 'date time salonId salonContextId serviceId staffId paymentMethod',
        populate: [
          {
            path: 'serviceId',
            select: 'name title price duration'
          },
          {
            path: 'staffId',
            select: 'name'
          },
          {
            path: 'salonContextId',
            select: 'businessName phoneNumber'
          },
          {
            path: 'salonId',
            select: 'email userName'
          }
        ]
      })
      .lean();

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Get salon context data
    let salonData: any = null;
    
    // Extract salon information from the populated salonContextId
    if ((complaint as any).appointmentId?.salonContextId) {
      salonData = (complaint as any).appointmentId.salonContextId;
    } else if ((complaint as any).appointmentId) {
      // Fallback: try to fetch salon data if salonContextId wasn't populated
      if ((complaint as any).appointmentId.salonContextId && typeof (complaint as any).appointmentId.salonContextId === 'string') {
        try {
          salonData = await SalonContext.findById((complaint as any).appointmentId.salonContextId)
            .select('businessName phoneNumber')
            .lean();
        } catch (error) {
          console.log(`[ADMIN_COMPLAINT_DETAIL] Error fetching salon context by ID:`, error);
        }
      } else if ((complaint as any).appointmentId.salonId) {
        try {
          salonData = await SalonContext.findOne({ userId: (complaint as any).appointmentId.salonId })
            .select('businessName phoneNumber')
            .lean();
        } catch (error) {
          console.log(`[ADMIN_COMPLAINT_DETAIL] Error fetching salon context by userId:`, error);
        }
      }
    }

    // Get salon owner email from the populated salonId
    let salonOwnerEmail = 'No email provided';
    if ((complaint as any).appointmentId?.salonId?.email) {
      salonOwnerEmail = (complaint as any).appointmentId.salonId.email;
    }

    console.log('[ADMIN_COMPLAINT_DETAIL] Salon data:', salonData);
    console.log('[ADMIN_COMPLAINT_DETAIL] Salon owner email:', salonOwnerEmail);
    console.log('[ADMIN_COMPLAINT_DETAIL] Complaint appointment:', (complaint as any).appointmentId);

    // Format the response
    const complaintData = {
      id: (complaint as any)._id.toString(),
      complainant: {
        name: (complaint as any).userId?.userName || 'Unknown User',
        contact: (complaint as any).userId?.phone || (complaint as any).userId?.mobileNumber || 'No phone provided',
        email: (complaint as any).userId?.email || 'No email provided',
      },
      defendant: {
        name: salonData?.businessName || 'Unknown Salon',
        contact: salonData?.phoneNumber || 'No contact provided',
        email: salonOwnerEmail,
        address: 'Address not available in salon context'
      },
      service: (complaint as any).appointmentId?.serviceId?.name || (complaint as any).appointmentId?.serviceId?.title || 'Unknown Service',
      appointment: {
        date: (complaint as any).appointmentId?.date 
          ? new Date((complaint as any).appointmentId.date).toISOString().split('T')[0] 
          : 'No date',
        time: (complaint as any).appointmentId?.time 
          ? `${String(Math.floor((complaint as any).appointmentId.time / 60)).padStart(2, '0')}:${String((complaint as any).appointmentId.time % 60).padStart(2, '0')}`
          : 'No time',
      },
      payment: (complaint as any).appointmentId?.serviceId?.price 
        ? `LKR ${(complaint as any).appointmentId.serviceId.price.toLocaleString()}`
        : 'Amount not available',
      paymentMethod: (complaint as any).appointmentId?.paymentMethod || 'Not specified',
      staffInvolved: (complaint as any).appointmentId?.staffId?.name || 'No staff assigned',
      status: (complaint as any).status === 'pending' ? 'Pending' 
              : (complaint as any).status === 'in-progress' ? 'In Progress'
              : (complaint as any).status === 'resolved' ? 'Resolved'
              : 'Closed',
      category: (complaint as any).category,
      subject: (complaint as any).subject,
      description: (complaint as any).description,
      createdAt: (complaint as any).createdAt,
      updatedAt: (complaint as any).updatedAt
    };

    return NextResponse.json(complaintData);
  } catch (error) {
    console.error("Error fetching complaint details:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaint details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const complaintId = params.id;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, in-progress, resolved, closed" },
        { status: 400 }
      );
    }

    // Get current complaint to track previous status
    const currentComplaint = await Complaint.findById(complaintId)
      .populate({
        path: 'userId',
        select: 'userName email'
      })
      .populate({
        path: 'appointmentId',
        select: 'serviceId',
        populate: {
          path: 'serviceId',
          select: 'name title'
        }
      });

    if (!currentComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    const previousStatus = currentComplaint.status;

    // Update complaint status
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Log admin activity
    try {
      const adminInfo = await getAdminInfo();
      if (adminInfo) {
        const complainantName = (currentComplaint as any).userId?.userName || 'Unknown User';
        const complainantEmail = (currentComplaint as any).userId?.email;
        const serviceName = (currentComplaint as any).appointmentId?.serviceId?.name || 
                           (currentComplaint as any).appointmentId?.serviceId?.title || 'Unknown Service';
        
        // Use complainant email as target, fallback to complaint description
        const target = complainantEmail || `complaint: ${complainantName} - ${serviceName}`;
        
        logAdminActivity({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          adminEmail: adminInfo.adminEmail,
          action: AdminActionType.COMPLAINT_MANAGEMENT,
          target: target,
          details: `Changed complaint status from ${previousStatus} to ${status} for complainant ${complainantName} (Service: ${serviceName})`,
          metadata: {
            complaintId: complaintId,
            complainantName,
            complainantEmail,
            serviceName,
            previousStatus,
            newStatus: status,
            complaintSubject: currentComplaint.subject,
            complaintCategory: currentComplaint.category,
            updatedAt: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }

    console.log(`[ADMIN_COMPLAINT_UPDATE] Complaint ${complaintId} status updated to: ${status}`);

    return NextResponse.json({
      message: "Complaint status updated successfully",
      status: status
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return NextResponse.json(
      { error: "Failed to update complaint status" },
      { status: 500 }
    );
  }
}
