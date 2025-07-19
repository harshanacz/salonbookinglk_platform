import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Service from "@/models/Service";
import Rating from "@/models/Rating";
import Staff from "@/models/Staff";

export async function GET(request: NextRequest) {
  try {
    console.log('[PAST_APPOINTMENTS] API called');
    const { userId } = await auth();
    console.log('[PAST_APPOINTMENTS] userId:', userId);
    
    if (!userId) {
      console.log('[PAST_APPOINTMENTS] No userId found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    console.log('[PAST_APPOINTMENTS] Database connected');

    // Find user in database
    const user = await User.findOne({ clerkUserId: userId });
    console.log('[PAST_APPOINTMENTS] User found:', user ? user._id : 'Not found');
    
    if (!user) {
      console.log('[PAST_APPOINTMENTS] User not found in database');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current date and time to filter past appointments
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const currentDate = new Date(currentYear, currentMonth, currentDay);
    const currentTimeInHHMM = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format
    
    console.log('[PAST_APPOINTMENTS] Current time:', {
      now: now.toISOString(),
      nowLocal: now.toString(),
      currentDate: currentDate.toISOString(),
      currentTimeInHHMM,
      currentHour: now.getHours(),
      currentMinute: now.getMinutes()
    });

    // Find all past appointments for this user
    // This includes: past dates OR (today's date AND time has passed)
    const pastAppointments = await Appointment.find({
      clientId: user._id,
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
      $or: [
        { date: { $lt: currentDate } }, // Past dates
        { 
          $and: [
            { 
              date: { 
                $gte: currentDate,
                $lt: new Date(currentYear, currentMonth, currentDay + 1)
              }
            }, // Today's date
            { time: { $lte: currentTimeInHHMM } } // Time has passed
          ]
        }
      ]
    })
    .populate('serviceId', 'title price duration images')
    .populate('salonId', 'name')
    .sort({ date: -1 })
    .limit(50); // Limit to last 50 appointments

    console.log('[PAST_APPOINTMENTS] Found appointments:', pastAppointments.length);
    pastAppointments.forEach(apt => {
      console.log(`- [PAST] ${apt._id}: ${apt.date.toDateString()} ${apt.time} (${apt.status}) - Current time: ${currentTimeInHHMM}`);
    });
    
    if (pastAppointments.length === 0) {
      console.log('[PAST_APPOINTMENTS] No appointments found for user');
      return NextResponse.json({ 
        pastAppointments: [],
        total: 0,
        message: 'No past appointments found'
      });
    }

    pastAppointments.forEach(apt => {
      console.log(`- ${apt._id}: ${apt.date} ${apt.time} (${apt.status})`);
    });

    // Get existing ratings for these appointments
    const appointmentIds = pastAppointments.map(app => app._id);
    const existingRatings = await Rating.find({
      appointmentId: { $in: appointmentIds },
      userId: user._id
    });

    // Create a map of ratings by appointment ID
    const ratingsMap = new Map();
    existingRatings.forEach(rating => {
      ratingsMap.set(rating.appointmentId.toString(), rating);
    });

    // Format the response
    const formattedAppointments = pastAppointments.map(appointment => {
      const service = appointment.serviceId as any;
      const salon = appointment.salonId as any;
      const existingRating = ratingsMap.get(appointment._id?.toString());

      return {
        id: appointment._id,
        appointmentId: appointment._id,
        serviceId: service._id,
        salonId: appointment.salonId,
        name: service.title,
        salonName: salon?.name || 'Unknown Salon',
        price: service.price,
        date: appointment.date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        image: service?.images?.[0] || '/placeholder.jpg',
        status: 'completed' as const,
        time: appointment.time ? `${Math.floor(appointment.time / 100).toString().padStart(2, '0')}:${(appointment.time % 100).toString().padStart(2, '0')}` : null,
        // Include existing rating if available
        currentRating: existingRating ? {
          ratingId: existingRating._id,
          rating: existingRating.rating,
          comment: existingRating.comment,
          createdAt: existingRating.createdAt
        } : null
      };
    });

    return NextResponse.json({ 
      pastAppointments: formattedAppointments,
      total: formattedAppointments.length
    });

  } catch (error) {
    console.error("Error fetching past appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch past appointments" },
      { status: 500 }
    );
  }
}
