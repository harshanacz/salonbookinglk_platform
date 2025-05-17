import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Set a cookie to indicate the profile is complete
    cookies().set("user-profile-complete", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking profile as complete:", error);
    return NextResponse.json(
      { error: "Failed to mark profile as complete" },
      { status: 500 }
    );
  }
}
