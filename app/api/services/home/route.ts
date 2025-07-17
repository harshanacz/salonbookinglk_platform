import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";
import User from "@/models/User";

// Fetch featured services for home page
export async function GET() { 
  try {
    await dbConnect();

    // Find all ACTIVE services
    const activeServices = await Service.find({ 
      status: ServiceStatus.ACTIVE 
    }).populate({
      path: "userId",
      select: "userName businessName",
      model: User
    }).lean({ virtuals: true });

    if (!activeServices.length) {
      return NextResponse.json({
        popularServices: [],
        topRatedServices: []
      });
    }

    // Transform data for frontend
    const transformedServices = activeServices.map(service => {
      // Handle populated data or objectId
      const userId = service.userId as any;
      const businessName = 
        userId && typeof userId === "object" && userId.businessName 
          ? userId.businessName 
          : "Unknown Salon";
      
      return {
        id: service._id.toString(),
        title: service.title,
        image: service.images && service.images.length > 0 ? service.images[0] : "/placeholder.svg?height=300&width=400",
        price: service.price,
        salon: businessName,
        salonContextId: service.salonContextId ? service.salonContextId.toString() : null,
        location: "Colombo", // Default location
        rating: service.averageRating || 4.5, // Default value if no rating
        reviews: service.reviewCount || 0,
        popularityScore: service.popularityScore || 0,
        type: service.type,
      };
    });

    // popularity
    const popularServices = [...transformedServices]
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 8); // limit to 8

    // Sort by rating
    const topRatedServices = [...transformedServices]
      .sort((a, b) => {
        // Create a combined score using both rating and review count
        const scoreA = a.rating + (a.reviews / 100); // Normalize reviews with division
        const scoreB = b.rating + (b.reviews / 100);
        
        // Sort by the combined score (highest first)
        return scoreB - scoreA;
      })
      .slice(0, 8); // Get top 8 

    return NextResponse.json({
      popularServices,
      topRatedServices
    });
  } catch (error) {
    console.error("Error fetching home services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}