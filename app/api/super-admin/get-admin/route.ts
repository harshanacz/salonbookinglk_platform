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
          // FIX: Use getUser, not createUser
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
