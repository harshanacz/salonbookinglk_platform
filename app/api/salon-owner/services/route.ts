import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import Service, { ServiceStatus } from "@/models/Service"; 

export async function POST(req: Request) {
  try { 

    //check the user is vaild
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
    
    // Get the SalonContext for this user
    const SalonContext = require('@/models/SalonContext').default;
    const salonContext = await SalonContext.findOne({ userId: user._id });
    
    if (!salonContext) {
      return new NextResponse("Salon profile not found. Please complete your salon profile first.", { status: 404 });
    }

    const body = await req.json();
    const { 
      title,
      type,
      description,
      images, 
      price,
      duration,
      staffAssigned,
    } = body;

    if (!title || !type || !price || !duration) {
        return new NextResponse("Missing required fields", { status: 400 });
    }
    if (images && !Array.isArray(images)) {
        return new NextResponse("Images must be an array", { status: 400 });
    }
     if (images && images.length > 3) {
        return new NextResponse("Maximum of 3 images allowed", { status: 400 });
    }



    const newService = await Service.create({ 
      userId: user._id,
      salonContextId: salonContext._id, 
      title,
      type,
      description,
      images: images || [], 
      price,
      duration,
      staffAssigned: staffAssigned || [], 
      status: ServiceStatus.PENDING, 
    });

    return NextResponse.json(newService, { status: 201 }); 

  } catch (error: any) {
    console.error("[SERVICE_POST]", error);

     if (error.name === 'ValidationError') {
        return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
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

    const services = await Service.find({ userId: user._id });
    const response = services.map((service) => ({
      id: service._id,
      title: service.title,
      image: service.images[0] || "",
      price: service.price,
      status: service.status.toLowerCase(),
      impressions: 0,
      clicks: 0,
      appointments: 0,
      staffAssigned: Array.isArray(service.staffAssigned) ? service.staffAssigned.length : 0,
      salonContextId: service.salonContextId ? service.salonContextId.toString() : null,
    }));

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[SERVICE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
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
    const { id, ...updateData } = body;
    if (!id) {
      return new NextResponse("Missing service id", { status: 400 });
    }
    const service = await Service.findOneAndUpdate(
      { _id: id, userId: user._id },
      updateData,
      { new: true }
    );
    if (!service) {
      return new NextResponse("Service not found", { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error: any) {
    console.error("[SERVICE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
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
    const { id } = body;
    if (!id) {
      return new NextResponse("Missing service id", { status: 400 });
    }
    const deleted = await Service.findOneAndDelete({ _id: id, userId: user._id });
    if (!deleted) {
      return new NextResponse("Service not found", { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[SERVICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
