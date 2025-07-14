import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { createSampleActivities } from "@/utils/createSampleActivities";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only super admins can create sample data
    if (user.type !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await createSampleActivities();

    if (result.success) {
      return NextResponse.json({
        message: `Successfully created ${result.count} sample activities`,
        success: true
      });
    } else {
      return NextResponse.json({
        error: "Failed to create sample activities",
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error creating sample activities:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
