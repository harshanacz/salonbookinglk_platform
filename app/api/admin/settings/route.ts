import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    
    // Check if user is admin
    const adminUser = await User.findOne({ clerkUserId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    // Get user data from Clerk
    // CORRECTED: Added 'await' for clerkClient()
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    return NextResponse.json({
      fullName: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || adminUser.userName || "",
      email: clerkUser.emailAddresses[0]?.emailAddress || adminUser.email || "",
    });
  } catch (error) {
    console.error("[ADMIN_SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    
    const adminUser = await User.findOne({ clerkUserId });
    if (!adminUser || !["ADMIN", "SUPER_ADMIN"].includes(adminUser.type)) {
      return new NextResponse("Forbidden: Admin access required", { status: 403 });
    }

    const body = await req.json();
    const { fullName } = body;

    // Only allow full name updates, not email changes
    if (!fullName) {
      return new NextResponse("Full name is required", { status: 400 });
    }

    const clerk = await clerkClient();

    // --- Clerk Update Logic - Only update name ---
    const nameParts = fullName.trim().split(" ");
    const clerkUpdateData = {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
    };

    await clerk.users.updateUser(clerkUserId, clerkUpdateData);
    
    // --- MongoDB Update Logic - Only update userName ---
    await User.findOneAndUpdate(
      { clerkUserId },
      { userName: fullName },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Settings updated successfully" 
    });
  } catch (error) {
    console.error("[ADMIN_SETTINGS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}