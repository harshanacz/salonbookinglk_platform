import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/models/Appointment";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

// Helper to validate if the ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid appointment ID" },
        { status: 400 }
      );
    }
      const appointment = await Appointment.findById(id)
      .populate('clientId', 'userName email mobileNumber')
      .populate('serviceId', 'type price duration')
      .populate('staffId', 'name');
      
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const { id } = params;
    const { status } = await request.json();
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid appointment ID" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find and update appointment
    const appointment = await Appointment.findById(id)
      .populate('clientId', 'userName email')
      .populate('serviceId', 'title');

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const previousStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    // Log admin activity
    try {
      const adminInfo = await getAdminInfo();
      if (adminInfo) {
        const clientName = (appointment.clientId as any)?.userName || 'Unknown Client';
        const serviceName = (appointment.serviceId as any)?.title || 'Unknown Service';
        
        logAdminActivity({
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName,
          adminEmail: adminInfo.adminEmail,
          action: AdminActionType.APPOINTMENT_APPROVAL,
          target: id,
          details: `Changed appointment status from ${previousStatus} to ${status} for client ${clientName} (Service: ${serviceName})`,
          metadata: {
            appointmentId: id,
            clientName,
            serviceName,
            previousStatus,
            newStatus: status,
            appointmentDate: appointment.date,
            appointmentTime: appointment.time
          }
        });
      }
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Appointment ${status.toLowerCase()} successfully`,
      appointment 
    });
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
