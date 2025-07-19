import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const salonId = searchParams.get("salonId");

    if (!salonId) {
      return NextResponse.json(
        { error: "Salon ID is required" },
        { status: 400 }
      );
    }

    // Find all active services for the specific salon
    const services = await Service.find({ 
      salonContextId: salonId,
      status: "ACTIVE"
    });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}