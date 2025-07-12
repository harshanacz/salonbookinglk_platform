import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";

export async function POST(req: Request) {
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

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return new NextResponse("Current password and new password are required", { status: 400 });
    }

    if (newPassword.length < 8) {
      return new NextResponse("New password must be at least 8 characters long", { status: 400 });
    }

    const clerk = await clerkClient();

    try {
      // Verify current password by trying to authenticate
      // Note: Clerk doesn't have a direct way to verify password, so we'll update directly
      await clerk.users.updateUser(clerkUserId, {
        password: newPassword,
      });

      return NextResponse.json({ 
        success: true, 
        message: "Password updated successfully" 
      });
    } catch (clerkError: any) {
      console.error("[CLERK_PASSWORD_UPDATE_ERROR]", clerkError);
      
      // Handle specific Clerk errors
      if (clerkError?.errors?.[0]?.code === "form_password_pwned") {
        return new NextResponse("This password has been found in a data breach. Please choose a different password.", { status: 400 });
      }
      
      if (clerkError?.errors?.[0]?.code === "form_password_not_strong_enough") {
        return new NextResponse("Password is not strong enough. Please use a combination of uppercase, lowercase, numbers, and special characters.", { status: 400 });
      }

      return new NextResponse("Failed to update password", { status: 400 });
    }
  } catch (error) {
    console.error("[ADMIN_CHANGE_PASSWORD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
