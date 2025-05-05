import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  console.log("[USER_POST] called");
  try {
    const { userId } = await auth();
    console.log("[USER_POST] userId:", userId);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("[USER_POST] body:", body);
    const {
      type,
      mobileNumber,
      userName,
      email,
      gender,
      country,
      profileImage,
      address,
    } = body;

    if (!userName) {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Ensure type is a valid UserType value
    if (type && !Object.values(UserType).includes(type as UserType)) {
      console.error("[USER_POST] Invalid user type:", type);
      return NextResponse.json(
        { message: `Invalid user type: ${type}. Valid types are: ${Object.values(UserType).join(", ")}` },
        { status: 400 }
      );
    }

    // Ensure gender is a valid option and exactly matches the enum values
    const validGenders = ["Male", "Female", "Prefer not to say"];
    let normalizedGender = gender;
    
    if (!gender || !validGenders.includes(gender)) {
      console.log(`[USER_POST] Invalid or missing gender: "${gender}". Using default.`);
      normalizedGender = "Prefer not to say";
    }

    // Debug log for troubleshooting
    console.log(`[USER_POST] Normalized gender: "${normalizedGender}"`);

    const clerk = await clerkClient();

    try {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          type: type,
        },
      });
    } catch (error) {
      console.error("[USER_POST] Clerk metadata update error:", error);
    }

    try {
      await dbConnect();
      console.log("[USER_POST] Database connected");
    } catch (error) {
      console.error("[USER_POST] Database connection error:", error);
      return NextResponse.json(
        { message: "Database connection failed", error: String(error) },
        { status: 500 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ clerkUserId: userId });
      if (existingUser) {
        console.log("[USER_POST] User already exists:", existingUser._id);
        return NextResponse.json(existingUser);
      }
    } catch (error) {
      console.error("[USER_POST] Error checking existing user:", error);
    }

    // Create new user
    try {
      // Ensure we're using valid UserType enum value
      const userType = type as UserType || UserType.CUSTOMER;
      console.log("[USER_POST] Using user type:", userType);

      const userData = {
        type: userType,
        mobileNumber: mobileNumber || "",
        clerkUserId: userId,
        userName,
        email,
        gender: normalizedGender, // Use the normalized gender
        country: country || "Sri Lanka",
        address: address || "",
        profileImage: profileImage || "",
        isActive: true,
      };
      
      console.log("[USER_POST] Creating user with data:", JSON.stringify(userData, null, 2));
      
      const newUser = await User.create(userData);
      console.log("[USER_POST] User created successfully:", newUser._id);
      return NextResponse.json(newUser);
    } catch (error) {
      console.error("[USER_POST] Detailed user creation error:", error);
      
      // Handle specific Mongoose validation errors
      if (error instanceof mongoose.Error.ValidationError) {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        console.error("[USER_POST] Validation errors:", validationErrors);
        
        return NextResponse.json(
          { 
            message: "Validation error", 
            errors: validationErrors,
            details: error.message 
          },
          { status: 400 }
        );
      } else if (error.code === 11000) {
        return NextResponse.json(
          { message: "User with this email or clerk ID already exists" },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          { message: "Failed to create user in database", error: String(error) },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("[USER_POST] Unhandled error:", error);
    return NextResponse.json(
      { message: "Internal Error", error: String(error) },
      { status: 500 }
    );
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
