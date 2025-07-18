import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import User from "@/models/User";
import Service from "@/models/Service";
import Rating from "@/models/Rating";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find user in database
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current date to filter past appointments
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Find all past appointments for this user
    const pastAppointments = await Appointment.find({
      clientId: user._id,
      date: { $lt: currentDate },
      status: { $in: ['CONFIRMED', 'COMPLETED'] }
    })
    .populate('serviceId', 'title price duration image')
    .populate('salonId', 'name')
    .sort({ date: -1 })
    .limit(50); // Limit to last 50 appointments

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
        image: service.image || '/placeholder.jpg',
        status: 'completed' as const,
        time: appointment.time ? `${Math.floor(appointment.time / 100)}:${(appointment.time % 100).toString().padStart(2, '0')}` : null,
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
