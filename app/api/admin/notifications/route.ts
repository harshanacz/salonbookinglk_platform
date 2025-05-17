import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notifications";
import { revalidatePath } from "next/cache";
import User, { UserType } from "@/models/User";
import sendEmail from "@/utils/sendEmail";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("GET /notifications - Unauthorized access attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      console.warn("GET /notifications - Authenticated user not found in DB");
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.ADMIN) {
      console.warn("GET /notifications - Forbidden: non-admin user attempted access");
      return new NextResponse("User is not an admin", { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const recipientType = url.searchParams.get("recipientType");
    const dateFilter = url.searchParams.get("date");

    const skip = (page - 1) * limit;
    const query: any = {};

    if (recipientType && recipientType !== "all") {
      query.recipientType = recipientType;
    }

    if (dateFilter) {
      const startDate = new Date(dateFilter);
      const endDate = new Date(dateFilter);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const total = await Notification.countDocuments(query);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sentBy", "email userName")
      .populate("selectedSalons", "userName email")
      .populate("selectedClients", "userName email");

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /notifications - Error:", error);
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
      console.warn("POST /notifications - Unauthorized access attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      console.warn("POST /notifications - Authenticated user not found in DB");
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.type !== UserType.ADMIN) {
      console.warn("POST /notifications - Forbidden: non-admin user attempted access");
      return new NextResponse("User is not an admin", { status: 403 });
    }

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

    if (!title || !description || !recipientType) {
      console.warn("POST /notifications - Missing required fields");
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const hasSalonRecipients =
      recipientType === "salons" &&
      (allSalons || (selectedSalons && selectedSalons.length > 0) || onlyVerifiedSalons);

    const hasClientRecipients =
      recipientType === "clients" &&
      (allClients || (selectedClients && selectedClients.length > 0));

    const hasAllRecipients = recipientType === "all";

    if (!(hasSalonRecipients || hasClientRecipients || hasAllRecipients)) {
      console.warn("POST /notifications - No recipients selected");
      return NextResponse.json(
        { message: "No recipients selected" },
        { status: 400 }
      );
    }

    // 1. First save the notification to database
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
      emailSent: false, // Initial state
    });

    // 2. Return response immediately after saving to database
    const response = NextResponse.json(
      {
        message: "Notification created successfully. Emails are being sent...",
        notification: newNotification,
      },
      { status: 201 }
    );

    // 3. Process email sending asynchronously (don't await)
    void (async () => {
      try {
        const emailRecipients: string[] = [];

        if (recipientType === "clients") {
          if (allClients) {
            const clients = await User.find({ type: UserType.CUSTOMER }).select("email");
            emailRecipients.push(...clients.map((c) => c.email));
          } else if (selectedClients && selectedClients.length > 0) {
            const specificClients = await User.find({
              _id: { $in: selectedClients },
            }).select("email");
            emailRecipients.push(...specificClients.map((c) => c.email));
          }
        } else if (recipientType === "salons") {
          if (allSalons) {
            const salons = await User.find({ type: UserType.SALON_OWNER }).select("email");
            emailRecipients.push(...salons.map((s) => s.email));
          } else if (onlyVerifiedSalons) {
            const verifiedSalons = await User.find({
              type: UserType.SALON_OWNER,
              verified: true,
            }).select("email");
            emailRecipients.push(...verifiedSalons.map((s) => s.email));
          } else if (selectedSalons && selectedSalons.length > 0) {
            const specificSalons = await User.find({
              _id: { $in: selectedSalons },
            }).select("email");
            emailRecipients.push(...specificSalons.map((s) => s.email));
          }
        } else if (recipientType === "all") {
          const allUsers = await User.find({
            $or: [
              { type: UserType.SALON_OWNER },
              { type: UserType.CUSTOMER },
            ],
          }).select("email");
          emailRecipients.push(...allUsers.map((u) => u.email));
        }

        if (emailRecipients.length > 0) {
          console.log(`Sending email to ${emailRecipients.length} recipients`);
          await sendEmail(
            emailRecipients.join(","),
            `New Notification: ${title}`,
            description
          );
          console.log("Email sent successfully");
          
          // Update notification status in database
            await Notification.findByIdAndUpdate(newNotification._id, {
            emailSent: true,
            emailSentAt: new Date(),
            });
        } else {
          console.log("No email recipients found or selected");
        }
      } catch (emailErr: any) {
        console.error("Failed to send email:", emailErr.message);
        // Update notification with error status
        await Notification.findByIdAndUpdate(newNotification._id, {
          emailError: emailErr.message,
        });
      }
    })();

    revalidatePath("/admin/notifications");
    return response;

  } catch (error: any) {
    console.error("POST /notifications - Error:", error);
    return NextResponse.json(
      { message: "Error creating notification", error: error.message },
      { status: 500 }
    );
  }
}