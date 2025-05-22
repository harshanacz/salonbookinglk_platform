import { NextRequest, NextResponse } from "next/server";
import Appointment from "@/models/Appointment";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// Helper to validate if the ID is a valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid appointment ID" },
        { status: 400 }
      );
    }
    
    const appointment = await Appointment.findById(id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('serviceId', 'name price duration')
      .populate('staffId', 'firstName lastName');
      
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid appointment ID" },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Format date if provided
    if (data.date) {
      data.date = new Date(data.date);
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
    .populate('clientId', 'firstName lastName email phone')
    .populate('serviceId', 'name price duration')
    .populate('staffId', 'firstName lastName');
    
    if (!updatedAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     await dbConnect();
    
//     const { id } = params;
    
//     if (!isValidObjectId(id)) {
//       return NextResponse.json(
//         { error: "Invalid appointment ID" },
//         { status: 400 }
//       );
//     }
    
//     const deletedAppointment = await Appointment.findByIdAndDelete(id);
    
//     if (!deletedAppointment) {
//       return NextResponse.json(
//         { error: "Appointment not found" },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({ message: "Appointment deleted successfully" });
//   } catch (error) {
//     console.error("Failed to delete appointment:", error);
//     return NextResponse.json(
//       { error: "Failed to delete appointment" },
//       { status: 500 }
//     );
//   }
// }
