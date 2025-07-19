import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[SALON_CONTEXT_GET] Invalid ID format: ${id}`);
      return NextResponse.json(
        { error: "Invalid salon context ID format" },
        { status: 400 }
      );
    }
      // First, try to find by _id and populate user to check if active
    let salonContext = await SalonContext.findById(id)
      .populate({
        path: "userId",
        select: "isActive",
        model: User
      })
      .lean();
    console.log(`[SALON_CONTEXT_GET] Finding by _id: ${id}, Result: ${salonContext ? 'Found' : 'Not found'}`);
    
    // If not found by _id, try finding by userId (in case the id is a user ID)
    if (!salonContext) {
      salonContext = await SalonContext.findOne({ userId: id })
        .populate({
          path: "userId",
          select: "isActive",
          model: User
        })
        .lean();
      console.log(`[SALON_CONTEXT_GET] Finding by userId: ${id}, Result: ${salonContext ? 'Found' : 'Not found'}`);
    }
    
    if (!salonContext) {
      console.log(`[SALON_CONTEXT_GET] Salon context not found for ID: ${id}`);
      return NextResponse.json(
        { error: "Salon context not found" },
        { status: 404 }
      );
    }

    // Check if the salon owner is active
    const contextObj = Array.isArray(salonContext) ? salonContext[0] : salonContext;
    const user = contextObj?.userId as any;
    if (!user || !user.isActive) {
      console.log(`[SALON_CONTEXT_GET] Salon belongs to deactivated user: ${id}`);
      return NextResponse.json(
        { error: "Salon not available" },
        { status: 404 }
      );
    }

    // Type assertion to help TypeScript understand the structure
    const salonData = salonContext as any;    console.log(`[SALON_CONTEXT_GET] Found salon: ${salonData.businessName}, Profile picture: ${salonData.profilePictureUrl || 'none'}`);
    
    // Return the salon context data
    return NextResponse.json({
      id: salonData._id.toString(),
      businessName: salonData.businessName,
      description: salonData.description,
      profilePictureUrl: salonData.profilePictureUrl || "/placeholder-logo.svg",
      phoneNumber: salonData.phoneNumber,
      reviewScore: salonData.reviewScore || 0,
      numberOfReviewers: salonData.numberOfReviewers || 0,
      location: salonData.location,
      isVerified: salonData.isVerified || false
    });
  } catch (error) {
    console.error("[SALON_CONTEXT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
