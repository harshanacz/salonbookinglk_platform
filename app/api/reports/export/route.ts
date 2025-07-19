import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User, { UserType } from "@/models/User";
import AppointmentModel from "@/models/Appointment";
import { AppointmentStatus } from "@/models/enums";
import { startOfDay, endOfDay, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkUserId });
    if (!user || user.type !== UserType.SALON_OWNER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (!fromDate) {
      return NextResponse.json({ error: "From date is required" }, { status: 400 });
    }

    const dateFrom = new Date(fromDate);
    const dateTo = toDate ? new Date(toDate) : new Date();

    // Fetch appointments
    const appointments = await AppointmentModel.find({
      salonId: user._id,
      status: AppointmentStatus.CONFIRMED,
      date: {
        $gte: startOfDay(dateFrom),
        $lte: endOfDay(dateTo)
      }
    })
    .populate('serviceId', 'title type price')
    .populate('clientId', 'userName email')
    .sort({ date: 1, time: 1 });

    // Generate CSV content
    const csvHeader = "Date,Time,Client,Service,Revenue,Payment Method,Status\n";
    const csvContent = appointments.map(apt => {
      const service = apt.serviceId as any;
      const client = apt.clientId as any;
      
      return [
        format(apt.date, 'yyyy-MM-dd'),
        apt.time ? `${Math.floor(apt.time / 100).toString().padStart(2, '0')}:${(apt.time % 100).toString().padStart(2, '0')}` : '',
        client?.userName || 'Unknown',
        service?.title || 'Unknown Service',
        (service?.price ?? 0),
        apt.paymentMethod || '',
        apt.status
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvContent;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="salon-report-${format(dateFrom, 'yyyy-MM-dd')}.csv"`
      }
    });

  } catch (error) {
    console.error("Error exporting reports:", error);
    return NextResponse.json({ error: "Failed to export reports" }, { status: 500 });
  }
}