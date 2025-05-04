import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, password, userName } = await req.json();

    // 1. Create Clerk user
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.createUser({
      emailAddress: [email],
      password,
      username: userName,
      publicMetadata: { type: "ADMIN" },
    });

    // 2. Create MongoDB record
    await dbConnect();
    const newUser = await User.create({
      type: "ADMIN",
      email,
      userName,
      clerkUserId: clerkUser.id,
      isActive: true,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    // Try to return Clerk error details if available
    if (error?.errors) {
      return NextResponse.json({ errors: error.errors }, { status: 422 });
    }
    // Fallback: always return JSON
    return NextResponse.json(
      { errors: [{ message: "Internal Error" }] },
      { status: 500 }
    );
  }
}
