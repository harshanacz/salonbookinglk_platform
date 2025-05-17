import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import SalonContext from "@/models/SalonContext";

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse(
        JSON.stringify({ message: "Forbidden: User is not a salon owner" }),
        { status: 403 }
      );
    }

    const salonContext = await SalonContext.findOne({ userId: user._id });
    if (!salonContext) {
      return new NextResponse(
        JSON.stringify({ message: "Salon context not found" }),
        { status: 404 }
      );
    }

    return NextResponse.json(salonContext);
  } catch (error: any) {
    console.error("[SALON_CONTEXT_GET]", error);
    return new NextResponse(
      JSON.stringify({
        message: error.message || "Internal Error",
        error: error.toString(),
      }),
      { status: 500 }
    );
  }
}
