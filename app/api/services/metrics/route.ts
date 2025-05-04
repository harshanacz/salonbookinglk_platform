import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { serviceId, metricType } = await request.json();
    
    if (!serviceId || !metricType) {
      return NextResponse.json(
        { error: "Missing required fields: serviceId and metricType" },
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
    
    // Update metrics based on the metric type
    if (metricType === 'view') {
      service.views += 1;
    } else if (metricType === 'booking') {
      service.bookings += 1;
      service.lastBookedAt = new Date();
    }
    
    // Recalculate popularity score: (views * 0.3) + (bookings * 0.7)
    service.popularityScore = (service.views * 0.3) + (service.bookings * 0.7);
    
    await service.save();
    
    return NextResponse.json({
      success: true,
      message: `Service ${metricType} recorded successfully`,
    });
  } catch (error) {
    console.error(`Error updating service metrics:`, error);
    return NextResponse.json(
      { error: "Failed to update service metrics" },
      { status: 500 }
    );
  }
}