import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

// Endpoint to track service metrics (views, bookings)
export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const { serviceId, metricType } = await req.json();
    
    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }
    
    if (!metricType || !['view', 'booking'].includes(metricType)) {
      return NextResponse.json(
        { error: "Valid metric type (view or booking) is required" },
        { status: 400 }
      );
    }
    
    // Find the service
    const service = await Service.findById(serviceId);
    
    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }
    
    // Update the appropriate metric
    if (metricType === 'view') {
      service.views += 1;
    } else if (metricType === 'booking') {
      service.bookings += 1;
      service.lastBookedAt = new Date();
    }
    
    // Recalculate popularity score
    service.popularityScore = (service.views * 0.3) + (service.bookings * 0.7);
    
    // Save the updated service
    await service.save();
    
    return NextResponse.json({ 
      success: true,
      message: `Service ${metricType} count updated successfully` 
    });
    
  } catch (error) {
    console.error(`Error updating service ${req.method} metrics:`, error);
    return NextResponse.json(
      { error: "Failed to update service metrics" },
      { status: 500 }
    );
  }
}