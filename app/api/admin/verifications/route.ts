import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";

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
    const status = searchParams.get("status") || "pending"; // pending, approved, rejected

    const skip = (page - 1) * limit;

    // Build query based on status
    let verificationQuery: any = {};
    
    if (status === "pending") {
      // Salons that have uploaded documents but are not verified yet
      verificationQuery = {
        businessRegistrationNumber: { $exists: true, $ne: "" },
        isVerified: false
      };
    } else if (status === "approved") {
      verificationQuery = {
        isVerified: true
      };
    } else if (status === "rejected") {
      // For now, we'll assume rejected means they submitted but verification was denied
      // You might want to add a separate field for rejection status
      verificationQuery = {
        businessRegistrationNumber: { $exists: true, $ne: "" },
        isVerified: false
        // Add a rejectedAt field in the future if needed
      };
    }

    // Find salon contexts that match the verification criteria
    const salonContexts = await SalonContext.find(verificationQuery)
      .populate('userId', 'email userName profileImage createdAt')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format the data for the frontend
    const formattedVerifications = salonContexts.map(context => {
      const user = context.userId as any;
      return {
        id: context._id.toString(),
        salonId: user._id.toString(),
        salonName: context.businessName,
        ownerName: context.ownerName,
        email: user.email,
        profileImage: context.profilePictureUrl || user.profileImage,
        businessRegistrationNumber: context.businessRegistrationNumber,
        phoneNumber: context.phoneNumber,
        address: context.location ? `${context.location.lat}, ${context.location.lng}` : "",
        website: context.website,
        description: context.description,
        isVerified: context.isVerified,
        submittedAt: context.updatedAt,
        createdAt: context.createdAt,
        status: context.isVerified ? "APPROVED" : "PENDING"
      };
    });

    const total = await SalonContext.countDocuments(verificationQuery);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      verifications: formattedVerifications,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
  }
}
