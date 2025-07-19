import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Complaint from "@/models/complaint";
import Appointment from "@/models/Appointment";
import SalonContext from "@/models/SalonContext";
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

    console.log("[ADMIN_COMPLAINTS] Fetching complaints...");

    // First, try to get basic complaints without population to debug
    const basicComplaints = await Complaint.find({}).limit(5).lean();
    console.log(`[ADMIN_COMPLAINTS] Basic complaints count: ${basicComplaints.length}`);
    console.log(`[ADMIN_COMPLAINTS] Sample basic complaint:`, basicComplaints[0] || 'No complaints found');

    // Fetch all complaints with populated data
    const complaints = await Complaint.find({})
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
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[ADMIN_COMPLAINTS] Found ${complaints.length} complaints`);

    // If no complaints found, return empty array or test data for development
    if (complaints.length === 0) {
      console.log("[ADMIN_COMPLAINTS] No complaints found in database");
      
      // In development, you might want to return some test data
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json([
          {
            id: 'test-001',
            title: 'Test Complaint - No Real Data',
            description: 'This is a test complaint because no real complaints exist in the database',
            category: 'service-issue',
            status: 'PENDING',
            priority: 'MEDIUM',
            complainant: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '+1234567890'
            },
            salon: {
              name: 'Test Salon',
              contact: '+0987654321',
              id: 'test-salon-001'
            },
            appointment: {
              id: 'test-appt-001',
              date: new Date().toISOString(),
              time: 1400,
              serviceName: 'Test Service',
              staffName: 'Test Staff',
              amount: 5000
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }
      
      return NextResponse.json([]);
    }

    // Enhance complaints with salon context data
    const enhancedComplaints = await Promise.all(
      complaints.map(async (complaint: any) => {
        try {
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
                  .select('businessName phoneNumber')
                  .lean();
              } catch (error) {
                console.log(`[ADMIN_COMPLAINTS] Error fetching salon context by ID:`, error);
              }
            } else if (complaint.appointmentId.salonId) {
              try {
                // Fallback: try to find salon context by userId (salonId)
                salonData = await SalonContext.findOne({ userId: complaint.appointmentId.salonId })
                  .select('businessName phoneNumber')
                  .lean();
              } catch (error) {
                console.log(`[ADMIN_COMPLAINTS] Error fetching salon context by userId:`, error);
              }
            }
          }

          // Get salon owner email from the populated salonId
          let salonOwnerEmail = 'No email provided';
          if (complaint.appointmentId?.salonId?.email) {
            salonOwnerEmail = complaint.appointmentId.salonId.email;
          }

          // Map status to admin-friendly format
          const statusMapping: { [key: string]: string } = {
            'pending': 'PENDING',
            'in-progress': 'IN_PROGRESS',
            'resolved': 'RESOLVED',
            'closed': 'CLOSED'
          };

          // Determine priority based on category and age
          let priority = 'MEDIUM';
          
          try {
            const daysSinceCreated = Math.floor((Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            
            if (complaint.category === 'service-issue' || complaint.category === 'payment-issue') {
              priority = 'HIGH';
            } else if (daysSinceCreated > 7) {
              priority = 'HIGH';
            } else if (daysSinceCreated < 2) {
              priority = 'LOW';
            }
          } catch (error) {
            console.log(`[ADMIN_COMPLAINTS] Error calculating priority:`, error);
          }

          return {
            id: complaint._id?.toString() || '',
            title: complaint.subject || 'No subject',
            description: complaint.description || 'No description',
            category: complaint.category || 'other',
            status: statusMapping[complaint.status] || 'PENDING',
            priority: priority,
            complainant: {
              name: userName,
              email: userEmail,
              phone: userPhone
            },
            salon: {
              name: salonData?.businessName || 'Unknown Salon',
              contact: salonData?.phoneNumber || 'No contact provided',
              email: salonOwnerEmail,
              id: complaint.appointmentId?.salonId?._id?.toString() || complaint.appointmentId?.salonContextId?.toString() || null
            },
            appointment: {
              id: complaint.appointmentId?._id?.toString() || null,
              date: complaint.appointmentId?.date || null,
              time: complaint.appointmentId?.time || null,
              serviceName: complaint.appointmentId?.serviceId?.name || complaint.appointmentId?.serviceId?.title || 'Unknown Service',
              staffName: complaint.appointmentId?.staffId?.name || 'No staff assigned',
              amount: complaint.appointmentId?.serviceId?.price || 0
            },
            createdAt: complaint.createdAt,
            updatedAt: complaint.updatedAt
          };
        } catch (error) {
          console.error(`[ADMIN_COMPLAINTS] Error processing complaint ${complaint._id}:`, error);
          // Return a basic complaint object even if processing fails
          return {
            id: complaint._id?.toString() || '',
            title: complaint.subject || 'No subject',
            description: complaint.description || 'No description',
            category: complaint.category || 'other',
            status: 'PENDING',
            priority: 'MEDIUM',
            complainant: {
              name: complaint.userId?.userName || 'Unknown User',
              email: complaint.userId?.email || 'No email provided',
              phone: complaint.userId?.phone || complaint.userId?.mobileNumber || 'No phone provided'
            },
            salon: {
              name: 'Unknown Salon',
              contact: 'No contact provided',
              id: null
            },
            appointment: {
              id: null,
              date: null,
              time: null,
              serviceName: 'Unknown Service',
              staffName: 'No staff assigned',
              amount: 0
            },
            createdAt: complaint.createdAt,
            updatedAt: complaint.updatedAt
          };
        }
      })
    );

    console.log(`[ADMIN_COMPLAINTS] Successfully processed ${enhancedComplaints.length} complaints`);
    return NextResponse.json(enhancedComplaints);
  } catch (error: any) {
    console.error("[ADMIN_COMPLAINTS] Error fetching complaints:", error);
    console.error("[ADMIN_COMPLAINTS] Error stack:", error.stack);
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

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find and update the complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    const previousStatus = complaint.status;
    const complaintTitle = complaint.subject;

    // Map admin status to database status
    const dbStatusMapping: { [key: string]: string } = {
      'PENDING': 'pending',
      'IN_PROGRESS': 'in-progress',
      'UNDER_REVIEW': 'in-progress', // Map to in-progress since database doesn't have under_review
      'RESOLVED': 'resolved',
      'REJECTED': 'closed',
      'CLOSED': 'closed'
    };

    const dbStatus = dbStatusMapping[status] || status.toLowerCase().replace('_', '-');
    
    // Update the complaint
    complaint.status = dbStatus;
    complaint.updatedAt = new Date();
    await complaint.save();

    // Log admin activity
    try {
      const adminInfo = await getAdminInfo();
      if (adminInfo) {
        // Use complaint title as target instead of ID
        const target = `complaint: ${complaintTitle}`;
        
        logAdminActivity({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          adminEmail: adminInfo.adminEmail,
          action: AdminActionType.COMPLAINT_MANAGEMENT,
          target: target,
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
