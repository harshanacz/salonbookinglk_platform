import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    console.log(`[Service API] Fetching service with ID: ${id}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[Service API] Invalid service ID format: ${id}`);
      return NextResponse.json(
        { error: "Invalid service ID format" },
        { status: 400 }
      );
    }
    
    // Fetch the service with populated user data (salon owner)
    const service = await Service.findById(id).populate({
      path: "userId",
      select: "userName businessName _id",
      model: User,
    }).lean({ virtuals: true });
    
    console.log(`[Service API] Service query result:`, service ? 'Found' : 'Not found');
    
    if (!service) {
      console.log(`[Service API] Service not found with ID: ${id}`);
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Get salon context for additional salon information
    let salonContext = null;
    if (service.userId && service.userId._id) {
      const SalonContext = mongoose.models.SalonContext || 
        mongoose.model("SalonContext", require("@/models/SalonContext").default.schema);
      
      salonContext = await SalonContext.findOne({
        userId: service.userId._id
      }).lean();
    }
    
    console.log(`[Service API] Salon context found:`, salonContext ? 'Yes' : 'No');
    
    // Transform the service data for the frontend
    const transformedService = {
      id: service._id.toString(),
      title: service.title,
      images: service.images && service.images.length > 0 
        ? service.images 
        : ["/placeholder.svg?height=600&width=800"],
      price: service.price,
      type: service.type,
      description: service.description ? service.description.split('\n').filter(Boolean) : [],
      duration: service.duration,
      salon: {
        id: service.userId?._id?.toString() || 'unknown',
        name: (service.userId as any)?.businessName || 'Unknown Salon',
        rating: service.averageRating || 4.5,
        reviews: service.reviewCount || 0,
        location: salonContext && !Array.isArray(salonContext) && salonContext.city
          ? `${salonContext.streetAddress}, ${salonContext.city}`
          : "Location not specified",
        isOpen: true, // This would need logic based on working hours
        openUntil: "7:30PM", // This would need calculation based on working hours
        bestSeller: service.popularityScore > 10, // Example threshold
      },
      staffAssigned: service.staffAssigned || [],
    };
    
    // Fetch other services from the same salon
    const relatedServicesQuery = {
      $and: [
        { _id: { $ne: id } }, // Not the same service
        { status: ServiceStatus.ACTIVE },
        ...(service.userId?._id ? [{ userId: service.userId._id }] : []) // Only services from same salon
      ]
    };

    const relatedServices = await Service.find(relatedServicesQuery)
      .populate({
        path: "userId",
        select: "businessName",
        model: User,
      })
      .limit(4)
      .lean({ virtuals: true });
    
    console.log(`[Service API] Found ${relatedServices.length} other services from the same salon`);
    
    // Transform related services
    const transformedRelatedServices = relatedServices.map(relService => ({
      id: relService._id.toString(),
      title: relService.title,
      image: relService.images && relService.images.length > 0 
        ? relService.images[0] 
        : "/placeholder.svg?height=300&width=400",
      price: relService.price,
      salon: (relService.userId as any)?.businessName || "Unknown Salon",
      rating: relService.averageRating || 4.5,
      reviews: relService.reviewCount || 0,
      location: "Colombo", // Default location
    }));
    
    // Fetch staff if available
    const staffMembers = [];
    if (service.staffAssigned && service.staffAssigned.length > 0) {
      // You could fetch real staff data here if available
      // For now, we'll use placeholder data
      for (let i = 0; i < service.staffAssigned.length; i++) {
        staffMembers.push({
          id: i + 1,
          name: `${service.staffAssigned[i]}`,
          image: "/placeholder.svg?height=100&width=100"
        });
      }
    } else {
      // Generate placeholder staff
      for (let i = 0; i < 6; i++) {
        staffMembers.push({
          id: i + 1,
          name: `Staff Member ${i + 1}`,
          image: "/placeholder.svg?height=100&width=100"
        });
      }
    }
    
    console.log(`[Service API] Successfully returning service data for ID: ${id}`);
    
    return NextResponse.json({
      service: transformedService,
      relatedServices: transformedRelatedServices,
      staff: staffMembers
    });
  } catch (error) {
    console.error("[Service API] Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service details" },
      { status: 500 }
    );
  }
}