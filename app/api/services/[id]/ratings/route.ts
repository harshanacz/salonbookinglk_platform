import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Rating from "@/models/Rating";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const serviceId = params.id;

    // Validate service ID
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
    }

    // Get URL parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Fetch ratings for the service
    const ratings = await Rating.find({ serviceId })
      .populate({
        path: 'userId',
        model: User,
        select: 'firstName lastName'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count for pagination
    const totalRatings = await Rating.countDocuments({ serviceId });

    // Calculate average rating
    const ratingStats = await Rating.aggregate([
      { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      }
    ]);

    // Calculate rating distribution (1-5 stars)
    let distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach((rating: number) => {
        distribution[rating as keyof typeof distribution]++;
      });
    }

    // Format the response data
    const formattedRatings = ratings.map((rating: any) => ({
      id: rating._id,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      user: {
        name: rating.userId ? `${rating.userId.firstName} ${rating.userId.lastName}` : "User"
      }
    }));

    return NextResponse.json({
      ratings: formattedRatings,
      statistics: {
        averageRating: ratingStats.length > 0 ? Number(ratingStats[0].averageRating.toFixed(1)) : 0,
        totalRatings: totalRatings,
        distribution: distribution
      },
      pagination: {
        total: totalRatings,
        limit: limit,
        skip: skip,
        hasMore: skip + limit < totalRatings
      }
    });

  } catch (error) {
    console.error("Error fetching service ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch service ratings" },
      { status: 500 }
    );
  }
}
