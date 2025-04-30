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
     // Handle potential validation errors from Mongoose
     if (error.name === 'ValidationError') {
        return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// a GET endpoint to fetch services 
