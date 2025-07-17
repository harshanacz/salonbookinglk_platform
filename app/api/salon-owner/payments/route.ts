import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import AppointmentModel from "@/models/Appointment";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";
import mongoose from "mongoose";


export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Salon Payments] Current user:", clerkUser.id);

    // Find the current user in the database
    const currentDbUser = await User.findOne({ clerkUserId: clerkUser.id });
    if (!currentDbUser) {
      console.log("[Salon Payments] User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("[Salon Payments] Found DB user:", currentDbUser._id);

    // Get all appointments where this user is the salon owner
    // Note: appointments have salonId pointing to the salon owner's user ID
    const appointments = await AppointmentModel.find({
      salonId: currentDbUser._id
    })
    .populate({
      path: 'clientId',
      select: 'userName email'
    })
    .populate({
      path: 'serviceId', 
      select: 'name price'
    })
    .sort({ createdAt: -1 });

    console.log("[Salon Payments] Found appointments:", appointments.length);

    // Transform appointments to payment format
    const payments = appointments.map(appointment => {
      const clientData = appointment.clientId as any;
      const serviceData = appointment.serviceId as any;
      
    return {
      id: (appointment._id as mongoose.Types.ObjectId).toString(),
      appointmentId: (appointment._id as mongoose.Types.ObjectId).toString(),
      client: clientData?.userName || 'Unknown Client',
      clientEmail: clientData?.email || 'No email',
      service: serviceData?.name || 'Unknown Service',
      amount: serviceData?.price || 0,
      date: appointment.date ? appointment.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: getPaymentStatus((appointment as any).paymentStatus, (appointment as any).paymentMethod),
      method: getPaymentMethodDisplay((appointment as any).paymentMethod),
      paymentIntentId: (appointment as any).paymentIntentId || null,
      note: (appointment as any).note || '',
      createdAt: appointment.createdAt ? appointment.createdAt.toISOString() : new Date().toISOString()
    };
    });

    console.log("[Salon Payments] Transformed payments:", payments.length);

    return NextResponse.json({ 
      payments,
      total: payments.length 
    });

  } catch (error) {
    console.error("[Salon Payments] Error fetching payments:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch payments", 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getPaymentStatus(paymentStatus?: string, paymentMethod?: string): string {
  // Handle undefined/null values
  if (!paymentStatus && !paymentMethod) {
    return 'Pending';
  }

  // If payment method is venue (cash), always pending until confirmed
  if (paymentMethod === 'VENUE' || paymentMethod === 'venue') {
    return 'Pending';
  }
  
  // Check payment status
  switch (paymentStatus?.toLowerCase()) {
    case 'completed':
    case 'success':
    case 'succeeded':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'failed':
    case 'canceled':
      return 'Failed';
    default:
      return 'Pending';
  }
}

function getPaymentMethodDisplay(paymentMethod?: string): string {
  if (!paymentMethod) {
    return 'Unknown';
  }

  switch (paymentMethod.toUpperCase()) {
    case 'VENUE':
      return 'Cash at Venue';
    case 'CARD_PAYMENT':
    case 'CARD':
      return 'Credit Card';
    case 'CASH':
      return 'Cash';
    case 'STRIPE':
      return 'Credit Card (Stripe)';
    default:
      return paymentMethod;
  }
}