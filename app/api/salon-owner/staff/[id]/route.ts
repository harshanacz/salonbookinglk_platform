import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Staff from "@/models/Staff";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    const staffId = params.id;
    const deleted = await Staff.findOneAndDelete({ _id: staffId, userId: user._id });

    if (!deleted) {
      return new NextResponse("Staff not found", { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[STAFF_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    const staffId = params.id;
    const body = await request.json();

    const updated = await Staff.findOneAndUpdate(
      { _id: staffId, userId: user._id },
      {
        name: body.name,
        email: body.email,
        mobileNumber: body.phone,
        role: body.role,
        bio: body.bio || "",
        availability: body.availability,
        workingDays: body.workingDays || [],
        services: body.services || [],
        profileImage: body.profileImage || "",
      },
      { new: true }
    );

    if (!updated) {
      return new NextResponse("Staff not found or not owned by user", { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });

  } catch (error: any) {
    console.error("[STAFF_UPDATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.SALON_OWNER) {
      return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
    }

    const staffId = params.id;
    const staff = await Staff.findOne({ _id: staffId, userId: user._id })
      .select('name email mobileNumber role bio availability workingDays services profileImage');  // Explicitly select all fields

    if (!staff) {
      return new NextResponse("Staff not found", { status: 404 });
    }

    return NextResponse.json(staff);

  } catch (error: any) {
    console.error("[STAFF_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
