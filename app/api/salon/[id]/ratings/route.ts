import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SalonContextModel from "@/models/SalonContext";
import ServiceModel from "@/models/Service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const salonId = params.id;

    // Get salon data with ratings
    const salon = await SalonContextModel.findById(salonId);
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    // Get all services for this salon with their ratings
    const services = await ServiceModel.find({ salonContextId: salonId }).select(
      'title averageRating reviewCount'
    );

    const serviceRatings = services
      .filter(service => service.reviewCount > 0)
      .map(service => ({
        serviceName: service.title,
        rating: service.averageRating || 0,
        reviewCount: service.reviewCount || 0,
      }))
      .sort((a, b) => b.reviewCount - a.reviewCount); // Sort by most reviewed

    return NextResponse.json({
      salonRating: {
        overallRating: salon.reviewScore || 0,
        totalReviews: salon.numberOfReviewers || 0,
      },
      serviceRatings,
    });

  } catch (error) {
    console.error("Error fetching salon ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch salon ratings" },
      { status: 500 }
    );
  }
}
