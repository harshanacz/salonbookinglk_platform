import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";

// Fetch featured services for home page
export async function GET() { 
  try {
    await dbConnect();

    // Find all ACTIVE services
    const activeServices = await Service.find({ 
      status: ServiceStatus.ACTIVE 
    }).populate({
      path: "userId",
      select: "userName businessName", // Get salon name info
      model: "User", // Explicitly specify the model
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
        location: "Colombo", // Default location
        rating: service.averageRating || 4.5, // Default value if no rating
        reviews: service.reviewCount || 0,
        popularityScore: service.popularityScore || 0,
        type: service.type,
      };
    });

    // Sort by popularity (views + bookings)
    const popularServices = [...transformedServices]
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 8); // Get top 8 popular services

    // Sort by rating (highest rated first)
    const topRatedServices = [...transformedServices]
      .sort((a, b) => {
        // First sort by rating
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // If ratings are the same, sort by number of reviews
        return b.reviews - a.reviews;
      })
      .slice(0, 8); // Get top 8 rated services

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