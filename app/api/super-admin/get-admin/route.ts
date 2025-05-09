import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // 1. Get all ADMIN users from MongoDB
    const adminUsers = await User.find({ type: "ADMIN" });

    // 2. Get Clerk user details for each admin
    const adminDetails = await Promise.all(
      adminUsers.map(async (admin) => {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(admin.clerkUserId);

          // Handle lastSignInAt (may be in seconds or ms)
          const rawLastSignIn = clerkUser.lastSignInAt;

          const lastSignedIn = rawLastSignIn
            ? new Date(
                rawLastSignIn > 9999999999
                  ? rawLastSignIn
                  : rawLastSignIn * 1000
              ).toISOString()
            : "Never";

          return {
            id: admin._id.toString(),
            clerkId: admin.clerkUserId,
            name: clerkUser.username || clerkUser.firstName || "N/A",
            email: admin.email,
            role: admin.type || "ADMIN",
            lastActive: lastSignedIn,
          };
        } catch (clerkError) {
          console.error(
            `Failed to fetch Clerk user for clerkUserId: ${admin.clerkUserId}:`,
            clerkError instanceof Error
              ? clerkError.message
              : String(clerkError)
          );

          return {
            id: admin._id.toString(),
            clerkId: admin.clerkUserId,
            name: admin.userName || "User Not Found in Clerk",
            email: admin.email,
            role: admin.type || "ADMIN",
            lastActive: "User not found in Clerk",
          };
        }
      })
    );

    return NextResponse.json({ admins: adminDetails });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { errors: [{ message: "Internal Error" }] },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    
    const { id, clerkId } = await request.json();

    if (!id || !clerkId) {
      return NextResponse.json(
        { errors: [{ message: "Missing required fields" }] },
        { status: 400 }
      );
    }

    // Delete from Clerk first
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(clerkId);

    } catch (clerkError) {
      console.error("Error deleting user from Clerk:", clerkError);
      // Continue with MongoDB deletion even if Clerk deletion fails
    }

    // Delete from MongoDB
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { errors: [{ message: "User not found in database" }] },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Admin deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { errors: [{ message: "Internal Error" }] },
      { status: 500 }
    );
  }
}