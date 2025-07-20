import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import SalonContext from "@/models/SalonContext";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findOne({ clerkUserId: userId });
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.type)) {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find users that have been deactivated for more than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const expiredUsers = await User.find({
      isActive: false,
      deactivatedAt: { $lt: thirtyDaysAgo, $ne: null }
    });

    const cleanupResults = [];

    // Delete expired user accounts and their associated salon contexts
    for (const user of expiredUsers) {
      // Find and delete associated salon context
      const salonContext = await SalonContext.findOne({ userId: user._id });
      let businessName = "Unknown Business";
      
      if (salonContext) {
        businessName = salonContext.businessName;
        await SalonContext.findByIdAndDelete(salonContext._id);
      }
      
      // Delete the user account
      await User.findByIdAndDelete(user._id);
      
      cleanupResults.push({
        userId: user._id,
        email: user.email,
        userName: user.userName,
        businessName: businessName,
        deactivatedAt: user.deactivatedAt,
        deleted: true
      });
    }

    return NextResponse.json({
      message: `Successfully cleaned up ${expiredUsers.length} expired deactivated accounts`,
      cleanedAccounts: cleanupResults,
      totalCleaned: expiredUsers.length
    });

  } catch (error) {
    console.error("[ADMIN_CLEANUP_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
