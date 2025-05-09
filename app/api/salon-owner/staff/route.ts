import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Staff from "@/models/Staff";

export async function POST(req: Request) {
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

    const body = await req.json();
    console.log("Received body:", body); // Debug log

    const { name, email, mobileNumber, role, availability, workingDays, bio, profileImage, status } = body;

    // Validate required fields
    if (!name || !email || !mobileNumber || !role || !availability || !workingDays) {
      return new NextResponse(
        JSON.stringify({
          message: "Missing required fields",
          receivedData: { name, email, mobileNumber, role, availability, workingDays }
        }), 
        { status: 400 }
      );
    }

    // Check if staff with email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return new NextResponse(
        JSON.stringify({ message: "Staff member with this email already exists" }),
        { status: 400 }
      );
    }

    const newStaff = await Staff.create({
      userId: user._id,
      name,
      email,
      mobileNumber,
      role,
      availability,
      workingDays,
      bio: bio || "",
      profileImage: profileImage || "",
      status: status || "Active" // Ensure status is set
    });

    console.log("Created staff:", newStaff); // Debug log

    return NextResponse.json(newStaff, { status: 201 });

  } catch (error: any) {
    console.error("[STAFF_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        message: error.message || "Internal Error",
        error: error.toString()
      }), 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
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

    const staff = await Staff.find({ userId: user._id });
    return NextResponse.json(staff);

  } catch (error: any) {
    console.error("[STAFF_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// export async function PUT(req: Request) {
//   try {
//     const { userId: clerkUserId } = await auth();
//     if (!clerkUserId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     await dbConnect();
//     const user = await User.findOne({ clerkUserId });

//     if (!user) {
//       return new NextResponse("User not found", { status: 404 });
//     }

//     if (user.type !== UserType.SALON_OWNER) {
//       return new NextResponse("Forbidden: User is not a salon owner", { status: 403 });
//     }

//     const body = await req.json();
//     const { id, ...updateData } = body;

//     if (!id) {
//       return new NextResponse("Missing staff id", { status: 400 });
//     }

//     const staff = await Staff.findOneAndUpdate(
//       { _id: id, userId: user._id },
//       updateData,
//       { new: true }
//     );

//     if (!staff) {
//       return new NextResponse("Staff not found", { status: 404 });
//     }

//     return NextResponse.json(staff);

//   } catch (error: any) {
//     console.error("[STAFF_PUT]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }


