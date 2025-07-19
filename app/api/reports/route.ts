import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";
import AppointmentModel from "@/models/Appointment";
import Service from "@/models/Service";
import { AppointmentStatus } from "@/models/enums";
import { startOfDay, endOfDay, subDays, isWithinInterval } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find the salon owner
    const user = await User.findOne({ clerkUserId });
    if (!user || user.type !== UserType.SALON_OWNER) {
      return NextResponse.json({ error: "Forbidden: User is not a salon owner" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const serviceType = searchParams.get("service");

    if (!fromDate) {
      return NextResponse.json({ error: "From date is required" }, { status: 400 });
    }

    const dateFrom = new Date(fromDate);
    const dateTo = toDate ? new Date(toDate) : new Date();

    // Calculate previous period for comparison
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    const previousFrom = subDays(dateFrom, daysDiff);
    const previousTo = subDays(dateFrom, 1);

    // Get salon context
    const salonContext = await SalonContext.findOne({ userId: user._id });
    if (!salonContext) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Build appointment filters
    const baseFilter = {
      salonId: user._id,
      status: AppointmentStatus.CONFIRMED,
      date: {
        $gte: startOfDay(dateFrom),
        $lte: endOfDay(dateTo)
      }
    };

    const previousPeriodFilter = {
      salonId: user._id,
      status: AppointmentStatus.CONFIRMED,
      date: {
        $gte: startOfDay(previousFrom),
        $lte: endOfDay(previousTo)
      }
    };

    // Get services for filtering
    let serviceFilter = {};
    if (serviceType && serviceType !== "all") {
      const services = await Service.find({ 
        userId: user._id, 
        type: serviceType 
      }).select('_id');
      serviceFilter = { serviceId: { $in: services.map(s => s._id) } };
    }

    // Fetch current period appointments
    const currentAppointments = await AppointmentModel.find({
      ...baseFilter,
      ...serviceFilter
    }).populate('serviceId', 'title type price');

    // Fetch previous period appointments
    const previousAppointments = await AppointmentModel.find({
      ...previousPeriodFilter,
      ...serviceFilter
    }).populate('serviceId', 'title type price');

    // Helper function to get appointment amount
    const getAppointmentAmount = (appointment: any) => {
      // Try different possible field names for the amount
      return appointment.totalAmount || 
             appointment.amount || 
             appointment.price || 
             (appointment.serviceId && appointment.serviceId.price) || 
             0;
    };

    // Calculate metrics
    const totalRevenue = currentAppointments.reduce((sum, apt) => {
      return sum + getAppointmentAmount(apt);
    }, 0);

    const totalAppointments = currentAppointments.length;

    const previousRevenue = previousAppointments.reduce((sum, apt) => {
      return sum + getAppointmentAmount(apt);
    }, 0);

    const previousAppointmentCount = previousAppointments.length;

    // Calculate new clients (first-time clients in the period)
    const clientIds = currentAppointments.map(apt => apt.clientId.toString());
    const uniqueClients = [...new Set(clientIds)];
    
    // Find clients who had their first appointment in this period
    const newClients = [];
    for (const clientId of uniqueClients) {
      const firstAppointment = await AppointmentModel.findOne({
        clientId,
        salonId: user._id,
        status: AppointmentStatus.CONFIRMED
      }).sort({ date: 1 });
      
      if (firstAppointment && isWithinInterval(firstAppointment.date, { start: dateFrom, end: dateTo })) {
        newClients.push(clientId);
      }
    }

    // Calculate previous period new clients
    const previousClientIds = previousAppointments.map(apt => apt.clientId.toString());
    const previousUniqueClients = [...new Set(previousClientIds)];
    const previousNewClients = [];
    
    for (const clientId of previousUniqueClients) {
      const firstAppointment = await AppointmentModel.findOne({
        clientId,
        salonId: user._id,
        status: AppointmentStatus.CONFIRMED
      }).sort({ date: 1 });
      
      if (firstAppointment && isWithinInterval(firstAppointment.date, { start: previousFrom, end: previousTo })) {
        previousNewClients.push(clientId);
      }
    }

    // Calculate popular services
    const serviceStats = currentAppointments.reduce((acc, appointment) => {
      const service = appointment.serviceId as any;
      if (service && service.title) {
        const serviceTitle = service.title;
        if (!acc[serviceTitle]) {
          acc[serviceTitle] = { 
            service: serviceTitle,
            count: 0, 
            revenue: 0,
            type: service.type 
          };
        }
        acc[serviceTitle].count++;
        acc[serviceTitle].revenue += getAppointmentAmount(appointment);
      }
      return acc;
    }, {} as Record<string, { service: string; count: number; revenue: number; type: string }>);

    const popularServices = Object.values(serviceStats)
      .sort((a, b) => b.count - a.count);

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    const appointmentsChange = previousAppointmentCount > 0 
      ? ((totalAppointments - previousAppointmentCount) / previousAppointmentCount) * 100 
      : totalAppointments > 0 ? 100 : 0;

    const newClientsChange = newClients.length - previousNewClients.length;

    // Get customer satisfaction from salon context
    const customerSatisfaction = salonContext.reviewScore || 4.5;

    const reportData = {
      totalRevenue,
      totalAppointments,
      newClients: newClients.length,
      customerSatisfaction,
      revenueChange,
      appointmentsChange,
      newClientsChange,
      popularServices,
      dateRange: {
        from: dateFrom,
        to: dateTo
      }
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error("Error generating reports:", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}