import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus, ServiceType } from "@/models/Service";

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    await dbConnect();
    
    // Map URL slug to ServiceType enum
    const categoryMapping: Record<string, ServiceType> = {
      "hair-cuts": ServiceType.HAIRCUT,
      "coloring": ServiceType.COLORING,
      "styling": ServiceType.STYLING,
      "facial": ServiceType.FACIAL,
      "massage": ServiceType.MASSAGE,
      "nails": ServiceType.NAILS,
      "skin-care": ServiceType.SKIN_CARE,
    };
    
    const { category } = params;
    const serviceType = categoryMapping[category];
    
    // If invalid category, return 404
    if (!serviceType) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    
    // Build query filters
    const filters: any = {
      status: ServiceStatus.ACTIVE,
      type: serviceType,
    };
    
    // Add search functionality if query parameter exists
    if (query) {
      filters.$or = [
        { title: { $regex: query, $options: "i" } },
      ];
    }
    
    // Fetch services with the matching type
    const services = await Service.find(filters)
      .populate({
        path: "userId",
        select: "userName businessName",
        model: "User", // Ensure the correct model is used
      })
      .sort({ popularityScore: -1 }) // Sort by popularity score
      .lean({ virtuals: true }); // Ensure virtuals are included if needed
    
    // Transform data for frontend
    const transformedServices = services.map(service => {
      // userId may be an ObjectId or a populated object
      const user = service.userId as { businessName?: string } | null;
      return {
        id: service._id.toString(),
        title: service.title,
        image: service.images && service.images.length > 0 ? service.images[0] : "/placeholder.svg?height=300&width=400",
        price: service.price,
        salon: user && typeof user === "object" && "businessName" in user && user.businessName
          ? user.businessName
          : "Unknown Salon",
        salonContextId: service.salonContextId ? service.salonContextId.toString() : null,
        location: "Colombo", // Default location
        rating: service.averageRating || 4.5,
        reviews: service.reviewCount || 0,
        type: service.type,
      };
    });
    
    return NextResponse.json(transformedServices);
  } catch (error) {
    console.error("Error fetching category services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}