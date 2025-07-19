import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";
import SalonContext from "@/models/SalonContext";
import { Document } from "mongoose";

interface SalonContextType extends Document {
  _id: string;
  location: {
    lat: number;
    lng: number;
  };
  description: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    
    // Build query filters
    const filters: any = {
      status: ServiceStatus.ACTIVE,
    };
    
    // Add search functionality if query parameter exists
    if (query) {
      filters.$or = [
        { title: { $regex: query, $options: "i" } },
      ];
    }
    
    // Fetch services with the matching criteria from active salon owners only
    const services = await Service.find(filters)
      .populate({
        path: "userId",
        select: "userName businessName isActive",
        model: "User",
        match: { isActive: true } // Only populate if user is active
      })
      .sort({ popularityScore: -1 })
      .lean({ virtuals: true });
    
    // Filter out services where userId population failed (deactivated users)
    const servicesFromActiveUsers = services.filter(service => 
      service.userId !== null
    );
    
    // Get salon contexts for all services from active users
    const salonContexts = (await SalonContext.find({
      _id: { $in: servicesFromActiveUsers.map(s => s.salonContextId).filter(Boolean) }
    }).lean()) as unknown as SalonContextType[];
    
    // Create a map of salon contexts for quick lookup
    const salonContextMap = new Map(
      salonContexts.map(context => [context._id.toString(), context])
    );
    
    // Transform data for frontend
    const transformedServices = servicesFromActiveUsers.map(service => {
      const salonContext = service.salonContextId 
        ? salonContextMap.get(service.salonContextId.toString())
        : null;
      
      const user = service.userId as { businessName?: string } | null;
      
      return {
        id: service._id.toString(),
        title: service.title,
        image: service.images && service.images.length > 0 
          ? service.images[0] 
          : "/placeholder.svg?height=300&width=400",
        price: service.price,
        salon: user && typeof user === "object" && "businessName" in user && user.businessName
          ? user.businessName
          : "Unknown Salon",
        salonContextId: service.salonContextId ? service.salonContextId.toString() : null,
        rating: service.averageRating || 4.5,
        reviews: service.reviewCount || 0,
        type: service.type,
        isBestSeller: service.popularityScore > 10,
      };
    });
    
    return NextResponse.json(transformedServices);
  } catch (error) {
    console.error("Error searching services:", error);
    return NextResponse.json(
      { error: "Failed to search services" },
      { status: 500 }
    );
  }
}