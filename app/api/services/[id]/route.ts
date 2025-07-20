import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service, { ServiceStatus } from "@/models/Service";
import User from "@/models/User";
import SalonContext, { Day } from "@/models/SalonContext";
import mongoose from "mongoose";
import Staff from "@/models/Staff";

interface BusinessHours {
  day: Day;
  isOpen: boolean;
  open: string;
  close: string;
}


interface SalonContextType {
  businessName: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  phoneNumber: string;
  reviewScore: number;
  numberOfReviewers: number;
  profilePictureUrl?: string;
  businessHours: BusinessHours[];

}

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
      select: "userName businessName _id type isActive",
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

    // Check if the salon owner is active
    if (
      !service.userId ||
      typeof service.userId !== "object" ||
      !(service.userId as any).isActive
    ) {
      console.log(`[Service API] Service belongs to deactivated salon owner: ${id}`);
      return NextResponse.json(
        { error: "Service not available" },
        { status: 404 }
      );
    }

    // Get salon context for additional salon information
    let salonContext: SalonContextType | null = null;
    if (service.userId && service.userId._id) {
      const rawSalonContext = await SalonContext.findOne({
        userId: service.userId._id
      }).lean() as any;
      
      if (rawSalonContext) {
        salonContext = {
          businessName: rawSalonContext.businessName || '',
          description: rawSalonContext.description || '',
          location: {
            lat: rawSalonContext.location?.lat || 0,
            lng: rawSalonContext.location?.lng || 0,
          },
          phoneNumber: rawSalonContext.phoneNumber || '',
          reviewScore: rawSalonContext.reviewScore || 0,
          numberOfReviewers: rawSalonContext.numberOfReviewers || 0,
          profilePictureUrl: rawSalonContext.profilePictureUrl,
          businessHours: rawSalonContext.businessHours || [],
        };
      }
    }
    
    console.log(`[Service API] Salon context found:`, salonContext ? 'Yes' : 'No');
    
    // Get current time and day
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() as Day;
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Check if salon is open based on business hours
    let isOpen = false;
    let openUntil = "";
    if (salonContext && salonContext.businessHours) {
      const todayHours = salonContext.businessHours.find(h => h.day === currentDay);
      if (todayHours && todayHours.isOpen) {
        isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
        openUntil = todayHours.close;
      }
    }
    
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
        name: salonContext?.businessName || (service.userId as any)?.businessName || 'Unknown Salon',
        rating: salonContext?.reviewScore || 4.5,
        reviews: salonContext?.numberOfReviewers || 0,
        location: salonContext ? `${salonContext.location.lat}, ${salonContext.location.lng}` : "Location not specified",
        address: salonContext?.description || "Address not specified",
        phoneNumber: salonContext?.phoneNumber || "Phone number not available",
        isOpen: isOpen,
        openUntil: openUntil,
        bestSeller: service.popularityScore > 10,
        profilePictureUrl: salonContext?.profilePictureUrl || "/placeholder.svg?height=100&width=100",
        todaysClosingTime: openUntil,
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
      salonContextId: relService.salonContextId ? relService.salonContextId.toString() : null,
      rating: relService.averageRating || 4.5,
      reviews: relService.reviewCount || 0,
      location: "Colombo", // Default location
    }));
    
    // Fetch staff if available
    let staffMembers = [];
    if (service.userId?._id) {
      staffMembers = await Staff.find({
        userId: service.userId._id,
        status: 'Active'
      }).select('_id name role profileImage');
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