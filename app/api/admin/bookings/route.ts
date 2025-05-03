// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import Booking from "@/models/Booking";

// export async function GET(req: Request) {
//   try {
//     // Check if user is authenticated
//     const { userId } = await auth();
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     // Get query parameters
//     const url = new URL(req.url);
//     const clientId = url.searchParams.get("clientId");
    
//     // Connect to database
//     await dbConnect();
    
//     // Build query
//     const query: any = {};
//     if (clientId) {
//       query.clientId = clientId;
//     }
    
//     // Fetch bookings based on query
//     const bookings = await Booking.find(query).populate('salonId serviceId');
    
//     // Transform the data to match the front-end expectations
//     const formattedBookings = bookings.map(booking => ({
//       id: booking._id,
//       date: booking.date,
//       time: booking.time,
//       salon: booking.salonId?.name || "Unknown Salon",
//       service: booking.serviceId?.name || "Unknown Service",
//       price: booking.serviceId?.price || 0,
//       status: booking.status,
//     }));
    
//     return NextResponse.json(formattedBookings);
//   } catch (error) {
//     console.error("[BOOKINGS_GET]", error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }
