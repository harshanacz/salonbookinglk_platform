import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import Rating from "@/models/Rating";
import Service from "@/models/Service";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import mongoose from "mongoose";
import { updateSalonOverallRating } from "@/utils/salonRatingUtils";

// GET - Retrieve ratings for a user or service
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const appointmentId = searchParams.get("appointmentId");

    let query: any = { userId: user._id };
    
    if (serviceId) query.serviceId = serviceId;
    if (appointmentId) query.appointmentId = appointmentId;

    const ratings = await Rating.find(query)
      .populate("serviceId", "title type")
      .populate("appointmentId", "date")
      .sort({ createdAt: -1 });

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

// POST - Create or update a rating
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { appointmentId, serviceId, rating, comment, ratingId } = await request.json();

    console.log("Rating API - Received data:", { appointmentId, serviceId, rating, comment, ratingId });

    // Validate required fields
    if (!appointmentId || !serviceId || !rating) {
      console.log("Rating API - Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: appointmentId, serviceId, rating" },
        { status: 400 }
      );
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      console.log("Rating API - Invalid rating value:", rating);
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(appointmentId) ||
        !mongoose.Types.ObjectId.isValid(serviceId)) {
      console.log("Rating API - Invalid ID format:", {
        appointmentId: { value: appointmentId, valid: mongoose.Types.ObjectId.isValid(appointmentId) },
        serviceId: { value: serviceId, valid: mongoose.Types.ObjectId.isValid(serviceId) }
      });
      
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Check if appointment exists and belongs to user
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      clientId: user._id
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found or doesn't belong to user" },
        { status: 404 }
      );
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    let existingRating = null;
    let isUpdate = false;

    // If ratingId is provided, this is an update
    if (ratingId && mongoose.Types.ObjectId.isValid(ratingId)) {
      existingRating = await Rating.findById(ratingId);
      if (existingRating && existingRating.userId.toString() === user._id.toString()) {
        isUpdate = true;
      }
    } else {
      // Check if rating already exists for this appointment
      existingRating = await Rating.findOne({
        appointmentId: appointmentId,
        userId: user._id,
        serviceId: serviceId
      });
      if (existingRating) {
        isUpdate = true;
      }
    }

    let savedRating;
    const oldRating = existingRating?.rating;

    if (isUpdate && existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment || '';
      existingRating.updatedAt = new Date();
      savedRating = await existingRating.save();
      console.log("Rating API - Updated existing rating:", savedRating._id);
    } else {
      // Create new rating
      const newRating = new Rating({
        userId: user._id,
        appointmentId: appointmentId,
        serviceId: serviceId,
        rating: rating,
        comment: comment || ''
      });
      savedRating = await newRating.save();
      console.log("Rating API - Created new rating:", savedRating._id);
    }

    // Update service statistics
    console.log("Rating API - Updating service statistics...");
    
    if (isUpdate && oldRating) {
      // Calculate new average when updating existing rating
      const currentTotal = service.averageRating * service.reviewCount;
      const newTotal = currentTotal - oldRating + rating;
      service.averageRating = parseFloat((newTotal / service.reviewCount).toFixed(2));
    } else {
      // Add new rating to statistics
      const currentTotal = service.averageRating * service.reviewCount;
      service.reviewCount += 1;
      const newTotal = currentTotal + rating;
      service.averageRating = parseFloat((newTotal / service.reviewCount).toFixed(2));
    }

    await service.save();
    console.log("Rating API - Service statistics updated:", {
      reviewCount: service.reviewCount,
      averageRating: service.averageRating
    });

    // Update overall salon rating based on all services
    console.log("Rating API - Updating salon overall rating...");
    try {
      await updateSalonOverallRating(service.salonContextId);
    } catch (error) {
      console.error("Rating API - Error updating salon overall rating:", error);
      // Don't fail the request if salon rating update fails
    }

    return NextResponse.json({
      success: true,
      rating: savedRating,
      isUpdate: isUpdate,
      serviceStats: {
        reviewCount: service.reviewCount,
        averageRating: service.averageRating
      }
    });

  } catch (error) {
    console.error("Error creating/updating rating:", error);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
