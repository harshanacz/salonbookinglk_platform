import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Complaint from "@/models/complaint";
import Appointment from "@/models/Appointment";
import SalonContext from "@/models/SalonContext";

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
        select: 'userName email phone'
      })
      .populate({
        path: 'appointmentId',
        select: 'date time salonId salonContextId serviceId staffId totalAmount paymentMethod',
        populate: [
          {
            path: 'serviceId',
            select: 'name price duration'
          },
          {
            path: 'staffId',
            select: 'name'
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
    
    if ((complaint as any).appointmentId?.salonContextId) {
      salonData = await SalonContext.findById((complaint as any).appointmentId.salonContextId)
        .select('businessName contactNumber email address')
        .lean();
    } else if ((complaint as any).appointmentId?.salonId) {
      salonData = await SalonContext.findOne({ userId: (complaint as any).appointmentId.salonId })
        .select('businessName contactNumber email address')
        .lean();
    }

    // Format the response
    const complaintData = {
      id: (complaint as any)._id.toString(),
      complainant: {
        name: (complaint as any).userId?.userName || 'Unknown User',
        contact: (complaint as any).userId?.phone || 'No phone provided',
        email: (complaint as any).userId?.email || 'No email provided',
      },
      defendant: {
        name: salonData?.businessName || 'Unknown Salon',
        contact: salonData?.contactNumber || 'No contact provided',
        email: salonData?.email || 'No email provided',
        address: salonData?.address || 'No address provided'
      },
      service: (complaint as any).appointmentId?.serviceId?.name || 'Unknown Service',
      appointment: {
        date: (complaint as any).appointmentId?.date 
          ? new Date((complaint as any).appointmentId.date).toISOString().split('T')[0] 
          : 'No date',
        time: (complaint as any).appointmentId?.time 
          ? `${Math.floor((complaint as any).appointmentId.time / 100)}:${String((complaint as any).appointmentId.time % 100).padStart(2, '0')}`
          : 'No time',
      },
      payment: (complaint as any).appointmentId?.totalAmount 
        ? `LKR ${(complaint as any).appointmentId.totalAmount.toLocaleString()}`
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
