import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notifications";
import { revalidatePath } from "next/cache";
import User, { UserType } from "@/models/User";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify user is an admin
    if (user.type !== UserType.ADMIN) {
      return new NextResponse("User is not an admin", { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const recipientType = url.searchParams.get("recipientType");
    const dateFilter = url.searchParams.get("date");
    
    const skip = (page - 1) * limit;
    
    // Prepare query
    const query: any = {};
    if (recipientType && recipientType !== "all") {
      query.recipientType = recipientType;
    }
    
    // Add date filter if provided
    if (dateFilter) {
      const startDate = new Date(dateFilter);
      const endDate = new Date(dateFilter);
      endDate.setDate(endDate.getDate() + 1);
      
      query.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    // Fetch notifications with pagination and sorting
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'sentBy',
        select: 'email userName'
      })
      .populate({
        path: 'selectedSalons',
        select: 'userName email'
      })
      .populate({
        path: 'selectedClients',
        select: 'userName email'
      });

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { message: "Error fetching notifications", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Find the user
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify user is an admin
    if (user.type !== UserType.ADMIN) {
      return new NextResponse("User is not an admin", { status: 403 });
    }

    // Parse the request body
    const {
      title,
      description,
      recipientType,
      allSalons,
      allClients,
      onlyVerifiedSalons,
      selectedSalons,
      selectedClients,
    } = await request.json();

    // Validate required fields
    if (!title || !description || !recipientType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate recipients
    const hasSalonRecipients =
      recipientType === "salons" &&
      (allSalons ||
        (selectedSalons && selectedSalons.length > 0) ||
        onlyVerifiedSalons);

    const hasClientRecipients =
      recipientType === "clients" &&
      (allClients || (selectedClients && selectedClients.length > 0));

    const hasAllRecipients = recipientType === "all";

    if (!(hasSalonRecipients || hasClientRecipients || hasAllRecipients)) {
      return NextResponse.json(
        { message: "No recipients selected" },
        { status: 400 }
      );
    }

    // Create the notification
    const newNotification = await Notification.create({
      title,
      description,
      recipientType,
      allSalons: allSalons || false,
      allClients: allClients || false,
      onlyVerifiedSalons: onlyVerifiedSalons || false,
      selectedSalons: selectedSalons || [],
      selectedClients: selectedClients || [],
      sentBy: user._id,
    });

    // Revalidate cache for any paths that display notifications
    revalidatePath("/admin/notifications");

    return NextResponse.json(
      {
        message: "Notification sent successfully",
        notification: newNotification,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { message: "Error creating notification", error: error.message },
      { status: 500 }
    );
  }
}