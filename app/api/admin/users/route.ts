import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  console.log("[USERS_GET] called");
  try {
    // Check if user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const id = url.searchParams.get("id");
    
    // Connect to database
    await dbConnect();
    
    // If ID is provided, fetch a single user
    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }
      return NextResponse.json(user);
    }
    
    // Build query for multiple users
    const query: any = {};
    if (type) {
      query.type = type;
    }
    
    // Fetch users based on query
    const users = await User.find(query);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
