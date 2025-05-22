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
    const location = searchParams.get("location") || "";
    
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
    
    // Fetch services with the matching criteria
    const services = await Service.find(filters)
      .populate({
        path: "userId",
        select: "userName businessName",
        model: "User",
      })
      .sort({ popularityScore: -1 })
      .lean({ virtuals: true });
    
    // Get salon contexts for all services
    const salonContexts = (await SalonContext.find({
      _id: { $in: services.map(s => s.salonContextId).filter(Boolean) }
    }).lean()) as unknown as SalonContextType[];
    
    // Create a map of salon contexts for quick lookup
    const salonContextMap = new Map(
      salonContexts.map(context => [context._id.toString(), context])
    );
    
    // Transform data for frontend
    const transformedServices = services.map(service => {
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
        location: salonContext?.location || { lat: 0, lng: 0 },
        address: salonContext?.description || "Location not specified",
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