import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Convert string ID to ObjectId
    const salonContextId = new mongoose.Types.ObjectId(params.id);
    console.log('Looking for services with salonContextId:', salonContextId);

    // Query services for this salon
    const services = await Service.find({
      salonContextId: salonContextId,
      status: "ACTIVE"
    }).select('_id title price duration type description images');

    console.log(`Found ${services.length} services for salon`);

    // Log each service for debugging
    services.forEach(service => {
      console.log('Service:', {
        id: service._id,
        title: service.title,
        salonContextId: service.salonContextId
      });
    });

    return NextResponse.json({
      success: true,
      services: services,
      debug: {
        queriedSalonId: salonContextId.toString(),
        foundServices: services.length
      }
    });
    
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
      debug: { 
        queriedId: params.id,
        errorType: error instanceof Error ? error.name : 'Unknown'
      }
    }, { status: 500 });
  }
}