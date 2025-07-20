import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import Appointment from "@/models/Appointment";

// Define types for better type safety
interface PaymentRecord {
  id: string;
  salon: string;
  service: string;
  amount: number;
  date: Date;
  status: 'Pending' | 'Completed' | 'Failed';
  method: string;
  appointmentId: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch user's appointments with payment details
    const appointments = await Appointment.find({ 
      clientId: userId,
      status: { $ne: 'CANCELLED' }
    })
    .populate('salonId', 'name')
    .populate('serviceId', 'title price duration')
    .sort({ createdAt: -1 });

    // Transform appointments into payment records
    const payments: PaymentRecord[] = appointments.map((apt: any) => {
      try {
        // Safely handle service data
        const service = apt.serviceId || {};
        const salon = apt.salonId || {};
        
        // Calculate amount from service price
        const amount = service.price || 0;
        
        // Determine payment status based on appointment status
        let paymentStatus: 'Pending' | 'Completed' | 'Failed' = 'Pending';
        if (apt.status === 'COMPLETED') {
          paymentStatus = 'Completed';
        } else if (apt.status === 'NO_SHOW') {
          paymentStatus = 'Failed';
        }

        return {
          id: apt._id ? apt._id.toString() : '',
          salon: salon.name || 'Unknown Salon',
          service: service.title || 'Unknown Service',
          amount: amount,
          date: apt.date || new Date(),
          status: paymentStatus,
          method: apt.paymentMethod || 'Venue',
          appointmentId: apt._id ? apt._id.toString() : '',
          createdAt: apt.createdAt || new Date()
        };
      } catch (mappingError) {
        console.error('Error mapping appointment:', apt._id, mappingError);
        // Return a safe fallback object
        return {
          id: apt._id ? apt._id.toString() : '',
          salon: 'Unknown Salon',
          service: 'Error loading service',
          amount: 0,
          date: new Date(),
          status: 'Failed' as const,
          method: 'Unknown',
          appointmentId: apt._id ? apt._id.toString() : '',
          createdAt: new Date()
        };
      }
    });

    const stats = calculatePaymentStats(payments);

    return NextResponse.json({
      success: true,
      payments,
      stats
    });

  } catch (error) {
    console.error("Error fetching user payments:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch payments"
    }, { status: 500 });
  }
}

function calculatePaymentStats(payments: PaymentRecord[]) {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const completedPayments = payments.filter(p => p.status === 'Completed');
  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const failedPayments = payments.filter(p => p.status === 'Failed');

  return {
    totalSpent: completedPayments.reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    completedPayments: completedPayments.length,
    failedPayments: failedPayments.length,
    pendingCount: pendingPayments.length,
    spentChange: calculateSpentChange(payments, lastMonth),
    completedChange: calculateCompletedChange(payments, lastMonth),
    failedChange: calculateFailedChange(payments, lastMonth)
  };
}

function calculateSpentChange(payments: PaymentRecord[], lastMonth: Date): string {
  const currentMonthPayments = payments.filter(p => 
    new Date(p.date) > lastMonth && p.status === 'Completed');
  const lastMonthPayments = payments.filter(p => 
    new Date(p.date) <= lastMonth && p.status === 'Completed');

  const currentSpent = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const lastSpent = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  return calculatePercentageChange(currentSpent, lastSpent);
}

function calculateCompletedChange(payments: PaymentRecord[], lastMonth: Date): string {
  const currentCompleted = payments.filter(p => 
    new Date(p.date) > lastMonth && p.status === 'Completed').length;
  const lastCompleted = payments.filter(p => 
    new Date(p.date) <= lastMonth && p.status === 'Completed').length;

  return calculatePercentageChange(currentCompleted, lastCompleted);
}

function calculateFailedChange(payments: PaymentRecord[], lastMonth: Date): string {
  const currentFailed = payments.filter(p => 
    new Date(p.date) > lastMonth && p.status === 'Failed').length;
  const lastFailed = payments.filter(p => 
    new Date(p.date) <= lastMonth && p.status === 'Failed').length;

  return calculatePercentageChange(currentFailed, lastFailed);
}

function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}