import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  console.log("[USER_POST] called");
  try {
    const { userId } = await auth();
    console.log("[USER_POST] userId:", userId);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      mobileNumber,
      userName,
      email,
      gender,
      country,
      profileImage,
    } = body;

    const clerk = await clerkClient();

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        type: type,
      },
    });

    await dbConnect();

    // Create new user
    const newUser = await User.create({
      type,
      mobileNumber,
      clerkUserId: userId,
      userName,
      email,
      gender,
      country,
      profileImage,
      isActive: true,
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[USER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  console.log("[USER_PATCH] called");
  try {
    const { userId } = await auth();
    console.log("[USER_PATCH] userId:", userId);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // Find the user by clerkUserId
    const user = await User.findOne({ clerkUserId: userId });
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
    console.error("[USER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  console.log("[USER_GET] called");
  try {
    const { userId } = await auth();
    console.log("[USER_GET] userId:", userId);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
