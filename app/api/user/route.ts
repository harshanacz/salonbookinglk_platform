import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { type, mobileNumber, userName, email, gender, country, profileImage } = body;

    await dbConnect();

    // Create new user
    const user = await User.create({
      type,
      mobileNumber,
      clerkUserId: userId,
      userName,
      email,
      gender,
      country,
      profileImage,
      isActive: true
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 