import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import SalonContext from "@/models/SalonContext";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    // Filter to only get SALON_OWNER users and populate their salon context
    const query = { type: "SALON_OWNER" };

    const salons = await User.find(query)
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for better performance

    // Get salon context data for each salon
    const salonsWithContext = await Promise.all(
      salons.map(async (salon: any) => {
        try {
          const salonContext: any = await SalonContext.findOne({ userId: salon._id }).lean();
          return {
            ...salon,
            salonContext: salonContext || null,
            // Add convenient access fields
            businessName: salonContext?.businessName || salon.userName || 'Unnamed Salon',
            phoneNumber: salonContext?.phoneNumber || salon.mobileNumber || '',
            location: salonContext?.location || null,
            isVerified: salonContext?.isVerified || false,
            profilePictureUrl: salonContext?.profilePictureUrl || salon.profileImage || '',
            address: salonContext?.location ? `${salonContext.location.lat}, ${salonContext.location.lng}` : ''
          };
        } catch (error) {
          console.error(`Error fetching salon context for salon ${salon._id}:`, error);
          return {
            ...salon,
            salonContext: null,
            businessName: salon.userName || 'Unnamed Salon',
            phoneNumber: salon.mobileNumber || '',
            location: null,
            isVerified: false,
            profilePictureUrl: salon.profileImage || '',
            address: ''
          };
        }
      })
    );

    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      salons: salonsWithContext,
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