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
      .populate('clientId', 'userName email mobileNumber')
      .populate('serviceId', 'type price duration')
      .populate('staffId', 'name');
      
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
