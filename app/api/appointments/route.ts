import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import Staff from "@/models/Staff";
import User from "@/models/User";
import AppointmentModel, { IAppointment } from "@/models/Appointment";
import Service from "@/models/Service";
import { AppointmentStatus, PaymentMethod } from "@/models/enums";
import mongoose from "mongoose";

// Define interface for Appointment document by extending IAppointment
interface AppointmentDocument extends IAppointment {}

// Type assertion for the Appointment model
const Appointment = AppointmentModel as mongoose.Model<AppointmentDocument>;

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get authenticated user
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the salon owner's user record
    const salonOwner = await User.findOne({ clerkUserId: clerkUser.id });
    if (!salonOwner) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the salon context for this owner
    const salonContext = await SalonContext.findOne({ userId: salonOwner._id });
    if (!salonContext) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Get appointments for this salon
    const appointments = await Appointment.find({ 
      salonContextId: salonContext._id 
    })
    .populate({
      path: "clientId",
      model: User,
      select: "userName email phone",
      options: { strictPopulate: false }
    })
    .populate({
      path: "serviceId", 
      model: Service,
      select: "title name price duration",
      options: { strictPopulate: false }
    })
    .populate({
      path: "staffId",
      model: Staff, 
      select: "name role",
      options: { strictPopulate: false }
    })
    .sort({ date: -1, time: 1 });

    console.log("Fetched appointments:", appointments.length);
    console.log("Sample appointment:", appointments[0] ? {
      clientId: appointments[0].clientId,
      serviceId: appointments[0].serviceId,
      staffId: appointments[0].staffId
    } : "No appointments");

    return NextResponse.json({ appointments });
    
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" }, 
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get the current authenticated user
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      console.log("[API/appointments] Authentication failed: No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("[API/appointments] Authenticated user ID:", clerkUser.id);

    // Parse the request body
    const data = await req.json();
    console.log("[API/appointments] Incoming booking data:", JSON.stringify(data, null, 2));
    const { 
      timeSlot, 
      salonId,      
      clientId, // This is ignored - we'll use the authenticated user instead
      serviceId,
      staffId,
      paymentMethod,
      note,
      date,
      time,
      paymentIntentId,
      totalAmount,
      paymentStatus
    } = data;
    
    // Debug log for ID validation
    console.log("[API/appointments] ID Validation:", {
      salonId: { 
        value: salonId, 
        isValid: mongoose.Types.ObjectId.isValid(salonId)
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
    
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service ID format" },
        { status: 400 }
      );
    }
    
    // Find the current user in the database using Clerk ID
    let currentDbUser;
    try {
      currentDbUser = await User.findOne({ clerkUserId: clerkUser.id });
      if (!currentDbUser) {
        console.log(`[API/appointments] User not found for Clerk ID: ${clerkUser.id}, creating new profile`);
        // Create a new user if not exists
        currentDbUser = await User.create({
          clerkUserId: clerkUser.id,
          type: "CUSTOMER", // Default type for this flow
          userName: clerkUser.firstName + " " + clerkUser.lastName,
          email: clerkUser.emailAddresses[0]?.emailAddress,
        });
        console.log(`[API/appointments] Created new user profile: ${currentDbUser._id}`);
      } else {
        console.log(`[API/appointments] Found user profile: ${currentDbUser._id}`);
      }
    } catch (error) {
      console.error("[API/appointments] Error finding or creating user:", error);
      return NextResponse.json(
        { error: "Failed to find or create user profile" },
        { status: 500 }
      );
    }
    
    // Try to find the salonContextId based on salonId
    let salonContext;
    try {
      salonContext = await SalonContext.findOne({ userId: salonId });
      if (!salonContext) {
        console.error(`[API/appointments] SalonContext not found for salonId: ${salonId}`);
        return NextResponse.json(
          { error: "Salon context not found for the provided salon ID" },
          { status: 404 }
        );
      }
      console.log(`[API/appointments] Found SalonContext: ${salonContext._id} for salonId: ${salonId}`);
    } catch (error) {
      console.error("[API/appointments] Error finding SalonContext:", error);
      return NextResponse.json(
        { error: "Failed to find salon context" },
        { status: 500 }
      );
    }

    // Build appointment data with valid ObjectIds
    const appointmentData = {
      salonId: new mongoose.Types.ObjectId(salonId),
      salonContextId: salonContext._id,
      clientId: currentDbUser._id, // Use the authenticated user's ID instead of passed clientId
      serviceId: new mongoose.Types.ObjectId(serviceId),
      date: new Date(date),
      time: timeAsNumber,
      paymentIntentId,
      totalAmount,
      paymentStatus: paymentStatus || 'pending',
      paymentMethod: paymentMethod, // Use the PaymentMethod value directly
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
          console.log(`[API/appointments] Time slot ${slotId} not found in staff schedule. Creating it dynamically.`);
          
          // Parse slot information from the timeSlot data in the request
          try {
            // Extract start time from the timeSlot passed in request
            console.log(`[API/appointments] Extracting time slot data:`, JSON.stringify(timeSlot, null, 2));
            
            if (!timeSlot.start_time) {
              console.error(`[API/appointments] Missing start_time in time slot data`);
              return NextResponse.json(
                { error: "Invalid time slot data: missing start_time" },
                { status: 400 }
              );
            }
            
            const startTime = new Date(timeSlot.start_time);
            const period = timeSlot.period || 30; // Default to 30 minutes if not provided
            
            // Create new time slot and add it to the staff schedule
            const newTimeSlot = {
              slot_id: slotId,
              start_time: startTime,
              appointmentId: savedAppointment._id,
              period: period
            };
            
            staffMember.timeSlots.push(newTimeSlot);
            console.log(`[API/appointments] Created new time slot with ID: ${slotId} for staff member`);
            await staffMember.save();
            
            // No need to update the salon's general timeSlots when a specific staff is booked
            // This allows other staff members to still be available at this time slot
            
            return NextResponse.json(
              { 
                success: true, 
                message: "Appointment booked successfully with staff member (new slot created)", 
                appointment: savedAppointment,
              },
              { status: 201 }
            );
          } catch (error) {
            console.error(`[API/appointments] Error creating time slot dynamically:`, error);
            return NextResponse.json(
              { error: "Failed to create time slot. Missing or invalid time slot data." },
              { status: 400 }
            );
          }
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
    }

    try {
      console.log(`[API/appointments] Looking for salon with ID: ${salonId}`);
      
      // Try to find salon by userId field first (this is the most common case)
      let salon = await SalonContext.findOne({ userId: salonId });
      
      // If not found by userId, try to find by _id directly
      if (!salon) {
        console.log(`[API/appointments] Salon not found by userId, trying _id: ${salonId}`);
        salon = await SalonContext.findById(salonId);
      }
      
      // If still not found, return error
      if (!salon) {
        console.error(`[API/appointments] Salon not found with ID: ${salonId}`);
        return NextResponse.json(
          { error: "Salon not found" },
          { status: 404 }
        );
      }
      
      console.log(`[API/appointments] Found salon: ${salon.businessName}`);
      
      const slotId = timeSlot.id || timeSlot.slot_id;
      console.log(`[API/appointments] Looking for time slot with ID: ${slotId} in salon schedule`);
      
      // Store salonContextId in the appointment for future reference
      savedAppointment.salonContextId = salon._id;
      await savedAppointment.save();
      
      const slotIndex = salon.timeSlots.findIndex(
        (slot: any) => slot.slot_id === slotId
      );
      
      if (slotIndex === -1) {
        console.log(`[API/appointments] Time slot ${slotId} not found in salon schedule. Creating it dynamically.`);
        
        // Parse slot information from the timeSlot data in the request
        try {
          // Extract start time from the timeSlot passed in request
          const startTime = new Date(timeSlot.start_time);
          const period = timeSlot.period || 30; // Default to 30 minutes if not provided
          
          // Create new time slot and add it to the salon schedule
          const newTimeSlot = {
            slot_id: slotId,
            start_time: startTime,
            appointmentId: savedAppointment._id,
            period: period
          };
          
          salon.timeSlots.push(newTimeSlot);
          console.log(`[API/appointments] Created new time slot with ID: ${slotId}`);
          await salon.save();
          
          return NextResponse.json(
            { 
              success: true, 
              message: "Appointment booked successfully with salon (new slot created)", 
              appointment: savedAppointment,
            },
            { status: 201 }
          );
        } catch (error) {
          console.error(`[API/appointments] Error creating time slot dynamically:`, error);
          return NextResponse.json(
            { error: "Failed to create time slot. Missing or invalid time slot data." },
            { status: 400 }
          );
        }
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
  await dbConnect();
  const { id, status } = await req.json();
  const updated = await Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (updated) {
    return NextResponse.json({ success: true, appointment: updated });
  }
  return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
}