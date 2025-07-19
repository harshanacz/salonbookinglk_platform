import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import Appointment from "@/models/Appointment";
import mongoose from "mongoose";

// Define types for better type safety
interface PaymentRecord {
  id: string;
  client: string;
  service: string;
  amount: number;
  date: Date;
  status: 'Pending' | 'Completed' | 'Failed';
  method: string;
  appointmentId: string;
  createdAt: Date;
}

// Define appointment interface for better type safety
interface AppointmentDocument {
  _id: mongoose.Types.ObjectId;
  userId?: {
    name?: string;
    email?: string;
  };
  services?: Array<{
    title?: string;
    price?: number;
    duration?: number;
  }>;
  appointmentDate?: Date;
  paymentStatus?: 'Pending' | 'Completed' | 'Failed';
  paymentMethod?: string;
  createdAt?: Date;
  salonContextId?: string;
  status?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch appointments with payment details
    const appointments = await Appointment.find({ 
      salonContextId: userId,
      status: { $ne: 'CANCELLED' }
    })
    .populate('userId', 'name email')
    .populate({
      path: 'services',
      select: 'title price duration'
    })
    .sort({ createdAt: -1 });

    // Transform appointments into payment records with proper error handling
    const payments: PaymentRecord[] = appointments.map((apt: any) => {
      try {
        // Safely handle services array
        const services = Array.isArray(apt.services) ? apt.services : [];
        
        // Calculate total amount with proper type checking
        const totalAmount = services.reduce((sum: number, service: any) => {
          const price = service && typeof service.price === 'number' ? service.price : 0;
          return sum + price;
        }, 0);

        // Safely extract service names
        const serviceNames = services
          .map((service: any) => service && service.title ? service.title : 'Unknown Service')
          .join(', ') || 'No Services';

        return {
          id: apt._id ? apt._id.toString() : '',
          client: apt.userId?.name || 'Unknown Client',
          service: serviceNames,
          amount: totalAmount,
          date: apt.appointmentDate || new Date(),
          status: apt.paymentStatus || 'Pending',
          method: apt.paymentMethod || 'Venue',
          appointmentId: apt._id ? apt._id.toString() : '',
          createdAt: apt.createdAt || new Date()
        };
      } catch (mappingError) {
        console.error('Error mapping appointment:', apt._id, mappingError);
        // Return a safe fallback object
        return {
          id: apt._id ? apt._id.toString() : '',
          client: 'Unknown Client',
          service: 'Error loading services',
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
    console.error("Error fetching payments:", error);
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
    totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
    completedPayments: completedPayments.length,
    failedPayments: failedPayments.length,
    pendingCount: pendingPayments.length,
    revenueChange: calculateRevenueChange(payments, lastMonth),
    completedChange: calculateCompletedChange(payments, lastMonth),
    failedChange: calculateFailedChange(payments, lastMonth)
  };
}

function calculateRevenueChange(payments: PaymentRecord[], lastMonth: Date): string {
  const currentMonthPayments = payments.filter(p => 
    new Date(p.date) > lastMonth && p.status === 'Completed');
  const lastMonthPayments = payments.filter(p => 
    new Date(p.date) <= lastMonth && p.status === 'Completed');

  const currentRevenue = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const lastRevenue = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  return calculatePercentageChange(currentRevenue, lastRevenue);
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