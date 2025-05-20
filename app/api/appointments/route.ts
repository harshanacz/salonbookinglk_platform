import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import Staff from "@/models/Staff";
import Appointment, { AppointmentStatus, PaymentMethod } from "@/models/Appointment";
import mongoose from "mongoose";

// In-memory storage for simple implementations
let inMemoryAppointments: any[] = [];

export async function GET() {
  return NextResponse.json({ appointments: inMemoryAppointments });
}

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Parse the request body
    const data = await req.json();
    console.log("[API/appointments] Incoming booking data:", data);
    const { 
      timeSlot, 
      salonId,
      userId,
      clientId, 
      serviceId,
      staffId,
      paymentMethod,
      note,
      date, // Format: "YYYY-MM-DD"
      time  // Format: "h:mm a"
    } = data;
    
    // Debug log for ID validation
    console.log("[API/appointments] ID Validation:", {
      salonId: { 
        value: salonId, 
        isValid: mongoose.Types.ObjectId.isValid(salonId)
      },
      userId: { 
        value: userId, 
        isValid: mongoose.Types.ObjectId.isValid(userId) 
      },
      clientId: { 
        value: clientId, 
        isValid: mongoose.Types.ObjectId.isValid(clientId) 
      },
      serviceId: { 
        value: serviceId, 
        isValid: mongoose.Types.ObjectId.isValid(serviceId) 
      },
      staffId: { 
        value: staffId, 
        isValid: staffId ? mongoose.Types.ObjectId.isValid(staffId) : "N/A" 
      }
    });

    if (!timeSlot || (!timeSlot.id && !timeSlot.slot_id)) {
      return NextResponse.json(
        { error: "Time slot information is required" },
        { status: 400 }
      );
    }

    if (!salonId) {
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 }
      );
    }

    // Parse the time to get hours as a number (for time field in Appointment model)
    const timeParts = time?.match(/(\d+):(\d+)\s*([ap]m)/i);
    let timeAsNumber = 0;
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3].toLowerCase();
      // Convert to 24-hour format
      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      timeAsNumber = hours * 100 + minutes; // E.g., 1430 for 2:30 PM
    }

    // Validate required ObjectIds before proceeding
    if (!mongoose.Types.ObjectId.isValid(salonId)) {
      return NextResponse.json(
        { error: "Invalid salon ID format" },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(clientId || userId)) {
      return NextResponse.json(
        { error: "Invalid client ID format" },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service ID format" },
        { status: 400 }
      );
    }
    
    // Build appointment data with valid ObjectIds
    const appointmentData = {
      userId: new mongoose.Types.ObjectId(salonId),
      clientId: new mongoose.Types.ObjectId(clientId || userId),
      serviceId: new mongoose.Types.ObjectId(serviceId),
      date: new Date(date),
      time: timeAsNumber,
      paymentMethod: paymentMethod === "card" ? PaymentMethod.CARD : 
                    paymentMethod === "online" ? PaymentMethod.ONLINE : PaymentMethod.CASH,
      note: note || "",
      status: AppointmentStatus.CONFIRMED,
    };
    // Add staffId to appointment data if provided and valid
    if (staffId && staffId !== "null" && staffId !== null) {
      console.log("[API/appointments] Processing staffId:", staffId, "type:", typeof staffId);
      if (!mongoose.Types.ObjectId.isValid(staffId)) {
        console.warn("[API/appointments] Invalid staffId format:", staffId);
      } else {
        (appointmentData as any)["staffId"] = new mongoose.Types.ObjectId(staffId);
        console.log("[API/appointments] Added staffId to appointment data");
      }
    } else {
      console.log("[API/appointments] No staffId provided or staffId is null");
    }

    // Create a new appointment
    let savedAppointment;
    try {
      console.log("[API/appointments] Creating appointment with data:", appointmentData);
      const newAppointment = new Appointment(appointmentData);
      savedAppointment = await newAppointment.save();
      console.log("[API/appointments] Appointment created successfully:", savedAppointment._id);
    } catch (error) {
      console.error("[API/appointments] Error creating appointment:", error);
      return NextResponse.json(
        { error: typeof error === "object" && error !== null && "message" in error ? (error as any).message : "Failed to create appointment" },
        { status: 500 }
      );
    }

    // Determine whether to update SalonContext or specific Staff member
    if (staffId) {
      try {
        console.log(`[API/appointments] Looking for staff member with ID: ${staffId}`);
        const staffMember = await Staff.findById(staffId);
        if (!staffMember) {
          console.error(`[API/appointments] Staff member not found with ID: ${staffId}`);
          return NextResponse.json(
            { error: "Staff member not found" },
            { status: 404 }
          );
        }
        console.log(`[API/appointments] Found staff member: ${staffMember.name}`);
        
        const slotId = timeSlot.id || timeSlot.slot_id;
        console.log(`[API/appointments] Looking for time slot with ID: ${slotId} in staff schedule`);
        
        const slotIndex = staffMember.timeSlots.findIndex(
          (slot: any) => slot.slot_id === slotId
        );
        
        if (slotIndex === -1) {
          console.error(`[API/appointments] Time slot ${slotId} not found in staff schedule`);
          return NextResponse.json(
            { error: "Time slot not found in staff schedule" },
            { status: 404 }
          );
        }
        
        console.log(`[API/appointments] Found time slot at index: ${slotIndex}, updating with appointment ID: ${savedAppointment._id}`);
        staffMember.timeSlots[slotIndex].appointmentId = savedAppointment._id;
        await staffMember.save();
        return NextResponse.json(
          { 
            success: true, 
            message: "Appointment booked successfully with staff member", 
            appointment: savedAppointment,
          },
          { status: 201 }
        );
      } catch (error: any) {
        console.error("Error updating staff time slot:", error);
        return NextResponse.json(
          { error: "Failed to book appointment with staff member" },
          { status: 500 }
        );
      }
    } else {
      try {
        console.log(`[API/appointments] Looking for salon with userId or _id: ${salonId}`);
        
        // Try to find salon by userId first
        let salon = await SalonContext.findOne({ userId: salonId });
        
        // If not found by userId, try to find by _id
        if (!salon) {
          console.log(`[API/appointments] Salon not found by userId, trying _id: ${salonId}`);
          salon = await SalonContext.findById(salonId);
        }
        
        // If still not found, return error
        if (!salon) {
          console.error(`[API/appointments] Salon not found with userId or _id: ${salonId}`);
          return NextResponse.json(
            { error: "Salon not found" },
            { status: 404 }
          );
        }
        console.log(`[API/appointments] Found salon: ${salon.businessName}`);
        
        const slotId = timeSlot.id || timeSlot.slot_id;
        console.log(`[API/appointments] Looking for time slot with ID: ${slotId} in salon schedule`);
        
        const slotIndex = salon.timeSlots.findIndex(
          (slot: any) => slot.slot_id === slotId
        );
        
        if (slotIndex === -1) {
          console.error(`[API/appointments] Time slot ${slotId} not found in salon schedule`);
          return NextResponse.json(
            { error: "Time slot not found in salon schedule" },
            { status: 404 }
          );
        }
        
        console.log(`[API/appointments] Found time slot at index: ${slotIndex}, updating with appointment ID: ${savedAppointment._id}`);
        salon.timeSlots[slotIndex].appointmentId = savedAppointment._id;
        await salon.save();
        return NextResponse.json(
          { 
            success: true, 
            message: "Appointment booked successfully with salon", 
            appointment: savedAppointment,
          },
          { status: 201 }
        );
      } catch (error: any) {
        console.error("Error updating salon time slot:", error);
        return NextResponse.json(
          { error: "Failed to book appointment with salon" },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("[API/appointments] Error in appointment booking API:", error);
    if (error && error.stack) {
      console.error("[API/appointments] Stack trace:", error.stack);
    }
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const idx = inMemoryAppointments.findIndex((a) => a.id === data.id);
  if (idx !== -1) {
    inMemoryAppointments[idx].status = data.status;
    return NextResponse.json({ success: true, appointment: inMemoryAppointments[idx] });
  }
  return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
}