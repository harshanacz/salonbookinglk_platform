import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notifications";
import { revalidatePath } from "next/cache";
import User, { UserType } from "@/models/User";

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

    // Verify user is a admin
    if (user.type !== UserType.ADMIN) {
      return new NextResponse("User is not a admin", { status: 403 });
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
      allSalons,
      allClients,
      onlyVerifiedSalons,
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
