import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service from "@/models/Service";
import { getServiceViews, syncServiceViewsToMongoDB } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is salon owner
    if (user.type !== UserType.SALON_OWNER) {
      return NextResponse.json(
        { error: "Forbidden: User is not a salon owner" },
        { status: 403 }
      );
    }

    // Get all services for this salon owner
    const services = await Service.find({ userId: user._id }).select('_id');
    const serviceIds = services.map(service => service._id.toString());

    // Sync all service views from Redis to MongoDB
    const syncResults = [];
    for (const serviceId of serviceIds) {
      try {
        const redisViews = await getServiceViews(serviceId);
        await syncServiceViewsToMongoDB(serviceId);
        syncResults.push({
          serviceId,
          views: redisViews,
          synced: true
        });
      } catch (error) {
        console.error(`Error syncing service ${serviceId}:`, error);
        syncResults.push({
          serviceId,
          views: 0,
          synced: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Service views synced successfully",
      results: syncResults,
      totalServices: serviceIds.length,
      successfulSyncs: syncResults.filter(r => r.synced).length
    });

  } catch (error) {
    console.error('Error in batch sync:', error);
    return NextResponse.json(
      { error: "Failed to sync service views" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is salon owner
    if (user.type !== UserType.SALON_OWNER) {
      return NextResponse.json(
        { error: "Forbidden: User is not a salon owner" },
        { status: 403 }
      );
    }

    // Get all services for this salon owner with their current view counts
    const services = await Service.find({ userId: user._id }).select('_id title viewsCount views');
    
    const serviceViews = [];
    for (const service of services) {
      try {
        const redisViews = await getServiceViews(service._id.toString());
        serviceViews.push({
          serviceId: service._id.toString(),
          title: service.title,
          mongoViews: service.viewsCount || 0,
          redisViews: redisViews,
          needsSync: redisViews !== (service.viewsCount || 0)
        });
      } catch (error) {
        console.error(`Error getting views for service ${service._id}:`, error);
        serviceViews.push({
          serviceId: service._id.toString(),
          title: service.title,
          mongoViews: service.viewsCount || 0,
          redisViews: 0,
          needsSync: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      serviceViews,
      totalServices: services.length,
      servicesNeedingSync: serviceViews.filter(s => s.needsSync).length
    });

  } catch (error) {
    console.error('Error getting service views:', error);
    return NextResponse.json(
      { error: "Failed to get service views" },
      { status: 500 }
    );
  }
}
