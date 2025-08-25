import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";
import mongoose from "mongoose";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";
import { getAdminInfo } from "@/utils/adminActivityMiddleware";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid verification ID format" }, { status: 400 });
    }

    // Find the salon context by ID
    const salonContext = await SalonContext.findById(id).populate('userId', 'email userName profileImage createdAt');
    
    if (!salonContext) {
      return NextResponse.json({ message: "Verification not found" }, { status: 404 });
    }

    const user = salonContext.userId as any;

    // Format the verification data
    const verificationData = {
      id: salonContext._id.toString(),
      salonId: user._id.toString(),
      salonName: salonContext.businessName,
      ownerName: salonContext.ownerName,
      email: user.email,
      profileImage: salonContext.profilePictureUrl || user.profileImage,
      businessRegistrationNumber: salonContext.businessRegistrationNumber,
      phoneNumber: salonContext.phoneNumber,
      address: salonContext.location ? `${salonContext.location.lat}, ${salonContext.location.lng}` : "",
      website: salonContext.website,
      description: salonContext.description,
      isVerified: salonContext.isVerified,
      submittedAt: salonContext.updatedAt,
      createdAt: salonContext.createdAt,
      status: salonContext.isVerified ? "APPROVED" : "PENDING",
      businessHours: salonContext.businessHours
    };

    return NextResponse.json(verificationData);
  } catch (error) {
    console.error("[ADMIN_VERIFICATION_GET]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { action } = body; // 'approve' or 'reject'
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid verification ID format" }, { status: 400 });
    }

    // Find the salon context
    const salonContext = await SalonContext.findById(id).populate('userId', 'email userName businessName');
    
    if (!salonContext) {
      return NextResponse.json({ message: "Verification not found" }, { status: 404 });
    }

    const user = salonContext.userId as any;

    // Helper function to log admin activity
    const logVerificationActivity = async (actionType: 'approved' | 'rejected', previousStatus: boolean, newStatus: string) => {
      try {
        const adminInfo = await getAdminInfo();
        if (adminInfo) {
          const target = user?.email || `salon: ${salonContext.businessName || 'Unknown'}`;
          
          logAdminActivity({
            adminId: adminInfo.adminId,
            adminName: adminInfo.adminName,
            adminEmail: adminInfo.adminEmail,
            action: AdminActionType.SALON_VERIFICATION,
            target: target,
            details: `${actionType === 'approved' ? 'Approved' : 'Rejected'} salon verification for "${salonContext.businessName}"`,
            metadata: {
              salonContextId: salonContext._id.toString(),
              salonName: salonContext.businessName,
              ownerName: salonContext.ownerName,
              salonEmail: user?.email,
              action: actionType,
              previousStatus: previousStatus ? 'verified' : 'pending',
              newStatus: newStatus
            }
          });
        }
      } catch (error) {
        console.error('Failed to log admin activity:', error);
      }
    };

    if (action === "approve") {
      // Approve the verification
      const previousStatus = salonContext.isVerified;
      salonContext.isVerified = true;
      await salonContext.save();

      // Log admin activity
      await logVerificationActivity('approved', previousStatus, 'verified');

      return NextResponse.json({ 
        message: "Salon verification approved successfully",
        verification: salonContext 
      });
    } else if (action === "reject") {
      // For rejection, we can either remove the document or add a rejection status
      // For now, let's just reset the verification status
      const previousStatus = salonContext.isVerified;
      salonContext.isVerified = false;
      // Optionally, you might want to add a rejection reason or timestamp
      await salonContext.save();

      // Log admin activity
      await logVerificationActivity('rejected', previousStatus, 'rejected');

      return NextResponse.json({ 
        message: "Salon verification rejected",
        verification: salonContext 
      });
    } else {
      return NextResponse.json({ message: "Invalid action. Use 'approve' or 'reject'" }, { status: 400 });
    }

  } catch (error) {
    console.error("[ADMIN_VERIFICATION_PATCH]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
