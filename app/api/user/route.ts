import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
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
    const {
      type,
      mobileNumber,
      userName,
      email,
      gender,
      country,
      profileImage,
    } = body;

    // Validate that the type matches the role in Clerk metadata
    const user = await currentUser();
    const role = user?.unsafeMetadata.role as string;

    if (
      (role === "salon-owner" && type !== "SALON_OWNER") ||
      (role === "customer" && type !== "CUSTOMER")
    ) {
      return new NextResponse("Invalid user type for role", { status: 400 });
    }

    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: type,
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
