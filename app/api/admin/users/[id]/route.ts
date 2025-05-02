import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_USER_GET_BY_ID] called");
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid user ID format", { status: 400 });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get booking statistics for the user
    // In a real app, you would query your bookings collection and calculate these values
    // For now, we'll return placeholder data
    const userWithStats = {
      ...user.toObject(),
      totalBookings: 0,  // Placeholder - replace with actual query
      totalSpent: 0,     // Placeholder - replace with actual query
      lastVisit: null    // Placeholder - replace with actual query
    };

    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error("[ADMIN_USER_GET_BY_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add an update handler for PATCH requests
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_USER_PATCH] called");
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to database
    await dbConnect();
    
    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid user ID format", { status: 400 });
    }

    const body = await req.json();

    const user = await User.findById(id);
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Only update fields provided in the request body
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined) {
        user[key] = body[key];
      }
    });

    await user.save();
    return NextResponse.json(user);
  } catch (error) {
    console.error("[ADMIN_USER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add a delete handler for DELETE requests
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("[ADMIN_USER_DELETE] called");
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to database
    await dbConnect();
    
    // Check if admin user
    const adminUser = await User.findOne({ clerkUserId: userId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const { id } = params;
    
    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return new NextResponse("Invalid user ID format", { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, { isActive: false });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return new NextResponse("User deactivated successfully", { status: 200 });
  } catch (error) {
    console.error("[ADMIN_USER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
