import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import { incrementServiceViews, syncServiceViewsToMongoDB } from "@/lib/redis";

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
      try {
        // Increment in Redis for real-time tracking
        const newViewCount = await incrementServiceViews(serviceId);
        
        // Sync to MongoDB every 10 views or periodically
        if (newViewCount % 10 === 0) {
          await syncServiceViewsToMongoDB(serviceId);
        }
        
        return NextResponse.json({
          success: true,
          message: `Service view recorded successfully`,
          viewCount: newViewCount,
        });
      } catch (error) {
        console.error('Redis error, falling back to MongoDB:', error);
        // Fallback to direct MongoDB update if Redis fails
        service.views += 1;
        service.viewsCount = service.views;
        await service.save();
        
        return NextResponse.json({
          success: true,
          message: `Service view recorded successfully (fallback)`,
          viewCount: service.viewsCount,
        });
      }
    } else if (metricType === 'booking') {
      service.bookings += 1;
      service.lastBookedAt = new Date();
      
      // Recalculate popularity score: (viewsCount * 0.3) + (bookings * 0.7)
      const viewCount = service.viewsCount || service.views || 0;
      service.popularityScore = (viewCount * 0.3) + (service.bookings * 0.7);
      
      await service.save();
      
      return NextResponse.json({
        success: true,
        message: `Service booking recorded successfully`,
      });
    }
    
    return NextResponse.json(
      { error: "Invalid metric type" },
      { status: 400 }
    );
  } catch (error) {
    console.error(`Error updating service metrics:`, error);
    return NextResponse.json(
      { error: "Failed to update service metrics" },
      { status: 500 }
    );
  }
}