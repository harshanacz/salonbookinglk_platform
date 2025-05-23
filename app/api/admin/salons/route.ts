import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Salon from "@/models/User";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const salons = await Salon.find()
      .skip(skip)
      .limit(limit);

    const total = await Salon.countDocuments();
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      salons,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching salons:", error);
    return NextResponse.json({ error: "Failed to fetch salons" }, { status: 500 });
  }
}