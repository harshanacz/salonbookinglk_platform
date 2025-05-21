import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import Service from "@/models/Service";
import SalonContext from "@/models/SalonContext";
import Staff from "@/models/Staff";
import { format, parse, addMinutes, startOfDay, endOfDay } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const staffId = searchParams.get("staffId");
    
    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch the service details
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Fetch the salon details to get business hours
    const salon = await SalonContext.findOne({ userId: service.userId });
    if (!salon) {
      return NextResponse.json(
        { error: "Salon not found" },
        { status: 404 }
      );
    }

    // Parse date and get day of week
    const selectedDate = parse(date, "yyyy-MM-dd", new Date());
    const dayOfWeek = format(selectedDate, "EEE").toUpperCase();
    
    // Get business hours for the selected day
    const businessHoursForDay = salon.businessHours.find(
      (hours: { day: string; }) => hours.day === dayOfWeek
    );

    if (!businessHoursForDay || !businessHoursForDay.isOpen) {
      return NextResponse.json(
        {
          timeSlots: [],
          message: "Salon is closed on this day",
        },
        { status: 200 }
      );
    }

    // Parse open and close times
    const openTime = parse(businessHoursForDay.open, "HH:mm", selectedDate);
    const closeTime = parse(businessHoursForDay.close, "HH:mm", selectedDate);
    
    // Create 30-minute time slots from opening to closing time
    const timeSlots = [];
    let currentTime = openTime;
    const serviceDuration = service.duration || 30; // Default to 30 minutes if not specified

    while (currentTime < closeTime) {
      const slot = {
        slot_id: `${format(currentTime, "yyyy-MM-dd-HH-mm")}`,
        start_time: new Date(currentTime),
        appointmentId: null,
        period: serviceDuration,
        available: true,
      };
      timeSlots.push(slot);
      currentTime = addMinutes(currentTime, 30);
    }

    // Get the day's start and end for querying
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    // Check which slots are already booked in salon timeSlots
    const salonBooked = salon.timeSlots.filter((slot: { start_time: string | number | Date; appointmentId: null; }) => {
      const slotDate = new Date(slot.start_time);
      return (
        slotDate >= dayStart &&
        slotDate <= dayEnd &&
        slot.appointmentId !== null
      );
    });

    // If a specific staff member is selected, also check their availability
    let staffBooked = [];
    if (staffId) {
      const staff = await Staff.findById(staffId);
      if (staff) {
        staffBooked = staff.timeSlots.filter((slot: { start_time: string | number | Date; appointmentId: null; }) => {
          const slotDate = new Date(slot.start_time);
          return (
            slotDate >= dayStart &&
            slotDate <= dayEnd &&
            slot.appointmentId !== null
          );
        });
      }
    }    // Mark booked slots as unavailable
    timeSlots.forEach((slot) => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = addMinutes(slotStart, serviceDuration);
      
      // If a specific staff member is selected, only check if that staff is booked
      if (staffId) {
        // For a specific staff member, we only care about their bookings
        const isStaffBooked = staffBooked.some((bookedSlot: { start_time: string | number | Date; period: number; }) => {
          const bookedStart = new Date(bookedSlot.start_time);
          const bookedEnd = addMinutes(bookedStart, bookedSlot.period);
          
          // Check if the slots overlap
          return (
            (slotStart >= bookedStart && slotStart < bookedEnd) ||
            (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
            (slotStart <= bookedStart && slotEnd >= bookedEnd)
          );
        });
        
        // Mark as unavailable only if this specific staff is booked
        if (isStaffBooked) {
          slot.available = false;
        }
      } else {
        // For "Any Professional" (general booking), we only care about slots that 
        // are booked for the salon in general (not staff-specific bookings)
        const isGenerallyBooked = salonBooked.some((bookedSlot: { start_time: string | number | Date; period: number; }) => {
          const bookedStart = new Date(bookedSlot.start_time);
          const bookedEnd = addMinutes(bookedStart, bookedSlot.period);
          
          // Check if the slots overlap
          return (
            (slotStart >= bookedStart && slotStart < bookedEnd) ||
            (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
            (slotStart <= bookedStart && slotEnd >= bookedEnd)
          );
        });
        
        // Mark as unavailable only for general salon bookings
        if (isGenerallyBooked) {
          slot.available = false;
        }
      }
    });

    return NextResponse.json(
      {
        timeSlots,
        businessHours: businessHoursForDay,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
