import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export async function GET(
  request: NextRequest,
  { params }: { params: { salonId: string } }
) {
  try {
    await dbConnect();
    const { salonId } = params;
    const url = new URL(request.url);
    const excludeId = url.searchParams.get('exclude');

    if (!salonId) {
      return NextResponse.json(
        { success: false, error: "Salon ID is required" },
        { status: 400 }
      );
    }

    const query: any = {
      salonContextId: salonId,
      status: "ACTIVE",
    };

    // Exclude main service if provided
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const services = await Service.find(query).select(
      'title price duration type description images averageRating reviewCount'
    );

    return NextResponse.json({
      success: true,
      services: services.map(service => ({
        _id: service._id.toString(),
        title: service.title,
        price: service.price,
        duration: service.duration,
        type: service.type,
        description: service.description,
        images: service.images
      }))
    });

  } catch (error) {
    console.error("Error fetching salon services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}