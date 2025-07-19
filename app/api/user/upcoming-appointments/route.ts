import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Staff from "@/models/Staff";

export async function GET(request: NextRequest) {
  try {
    console.log('[UPCOMING_APPOINTMENTS] API called');
    const { userId } = await auth();
    console.log('[UPCOMING_APPOINTMENTS] userId:', userId);
    
    if (!userId) {
      console.log('[UPCOMING_APPOINTMENTS] No userId found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    console.log('[UPCOMING_APPOINTMENTS] Database connected');

    // Find user in database
    const user = await User.findOne({ clerkUserId: userId });
    console.log('[UPCOMING_APPOINTMENTS] User found:', user ? user._id : 'Not found');
    
    if (!user) {
      console.log('[UPCOMING_APPOINTMENTS] User not found in database');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current date and time to filter upcoming appointments
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const currentDate = new Date(currentYear, currentMonth, currentDay);
    const currentTimeInHHMM = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format
    
    console.log('[UPCOMING_APPOINTMENTS] Current time:', {
      now: now.toISOString(),
      nowLocal: now.toString(),
      currentDate: currentDate.toISOString(),
      currentTimeInHHMM,
      currentHour: now.getHours(),
      currentMinute: now.getMinutes()
    });

    // Find all upcoming appointments for this user
    // This includes: future dates OR (today's date AND time hasn't passed yet)
    const upcomingAppointments = await Appointment.find({
      clientId: user._id,
      status: { $in: ['CONFIRMED', 'PENDING'] },
      $or: [
        { date: { $gt: currentDate } }, // Future dates
        { 
          $and: [
            { 
              date: { 
                $gte: currentDate,
                $lt: new Date(currentYear, currentMonth, currentDay + 1)
              }
            }, // Today's date
            { time: { $gt: currentTimeInHHMM } } // Time hasn't passed yet
          ]
        }
      ]
    })
    .populate('serviceId', 'title price duration images')
    .populate('salonId', 'name image')
    .populate('staffId', 'name')
    .sort({ date: 1, time: 1 })
    .limit(50);

    console.log('[UPCOMING_APPOINTMENTS] Found appointments:', upcomingAppointments.length);
    if (upcomingAppointments.length === 0) {
      console.log('[UPCOMING_APPOINTMENTS] No appointments found for user');
      return NextResponse.json({ 
        upcomingAppointments: [],
        total: 0,
        message: 'No upcoming appointments found'
      });
    }

    upcomingAppointments.forEach(apt => {
      console.log(`- [UPCOMING] ${apt._id}: ${apt.date.toDateString()} ${apt.time} (${apt.status}) - Current time: ${currentTimeInHHMM}`);
    });

    // Format the response
    const formattedAppointments = upcomingAppointments.map(appointment => {
      const service = appointment.serviceId as any;
      const salon = appointment.salonId as any;
      const staff = appointment.staffId as any;

      // Format time from HHMM format to string (e.g., 1000 = "10:00", 1600 = "16:00")
      const timeFormatted = appointment.time ? 
        `${Math.floor(appointment.time / 100).toString().padStart(2, '0')}:${(appointment.time % 100).toString().padStart(2, '0')}` 
        : null;

      return {
        id: appointment._id,
        salon: salon?.name || 'Unknown Salon',
        salonId: appointment.salonId,
        date: appointment.date,
        price: service.price || 0,
        image: service?.images?.[0] || salon?.image || '/placeholder.jpg',
        services: [{
          id: service._id,
          name: service.title,
          price: service.price,
          duration: service.duration,
          professional: staff?.name,
          image: service?.images?.[0] || '/placeholder.jpg'
        }],
        status: appointment.status === 'CONFIRMED' ? 'Confirmed' : 
                appointment.status === 'PENDING' ? 'Confirmed' : 'Confirmed',
        appointmentTime: timeFormatted,
        professional: staff?.name,
        paymentMethod: appointment.paymentMethod,
        note: appointment.note
      };
    });

    return NextResponse.json({ 
      upcomingAppointments: formattedAppointments,
      total: formattedAppointments.length
    });

  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming appointments" },
      { status: 500 }
    );
  }
}
