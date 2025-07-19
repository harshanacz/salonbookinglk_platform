import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { recalculateAllSalonRatings, updateSalonOverallRating } from "@/utils/salonRatingUtils";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { action, salonId } = await request.json();

    if (action === "recalculate-all") {
      // Recalculate all salon ratings
      await recalculateAllSalonRatings();
      return NextResponse.json({ 
        success: true, 
        message: "All salon ratings recalculated successfully" 
      });
    } else if (action === "recalculate-single" && salonId) {
      // Recalculate specific salon rating
      await updateSalonOverallRating(salonId);
      return NextResponse.json({ 
        success: true, 
        message: `Salon ${salonId} rating recalculated successfully` 
      });
    } else {
      return NextResponse.json({ 
        error: "Invalid action or missing salonId" 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Error in salon rating calculation:", error);
    return NextResponse.json(
      { error: "Failed to calculate salon ratings" },
      { status: 500 }
    );
  }
}
