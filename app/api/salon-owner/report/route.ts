import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Appointment from "@/models/Appointment";
import User, { UserType } from "@/models/User";
import dbConnect from "@/lib/mongodb";

// This route now provides detailed chart data (can be used for additional analytics)
export async function GET(request: Request) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ clerkUserId });

        if (!user || user.type !== UserType.SALON_OWNER) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const fromDate = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
        const toDate = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

        const matchQuery = {
            salonId: user._id,
            ...(fromDate && toDate && {
                createdAt: {
                    $gte: fromDate,
                    $lte: new Date(toDate.setHours(23, 59, 59, 999))
                }
            })
        };

        // Debug log
        console.log('Date Range:', { fromDate, toDate });
        console.log('Match Query:', matchQuery);

        try {
            // First get total count for verification
            const totalCount = await Appointment.countDocuments(matchQuery);
            console.log('Total appointments found:', totalCount);

            const stats = await Appointment.aggregate([
                { 
                    $match: matchQuery 
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service"
                    }
                },
                { 
                    $unwind: {
                        path: "$service",
                        preserveNullAndEmptyArrays: true // Keep appointments even if service is missing
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { 
                            $sum: { 
                                $ifNull: ["$service.price", 0] 
                            }
                        },
                        totalAppointments: { $sum: 1 },
                        uniqueClients: { $addToSet: "$clientId" }
                    }
                }
            ]);

            const summary = stats[0] || {
                totalRevenue: 0,
                totalAppointments: 0,
                uniqueClients: []
            };

            // Add service distribution (pie chart)
            const serviceDistribution = await Appointment.aggregate([
                { $match: matchQuery },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service"
                    }
                },
                { $unwind: "$service" },
                {
                    $group: {
                        _id: "$service.type",
                        count: { $sum: 1 },
                        revenue: { $sum: "$service.price" }
                    }
                },
                {
                    $project: {
                        name: "$_id",
                        value: "$count",
                        revenue: "$revenue"
                    }
                }
            ]);

            // Weekly revenue data (line chart)
            const weeklyRevenue = await Appointment.aggregate([
                { $match: matchQuery },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service"
                    }
                },
                { $unwind: "$service" },
                {
                    $group: {
                        _id: {
                            $dateToString: { 
                                format: "%Y-%m-%d", 
                                date: "$createdAt"  // Changed from $date to $createdAt
                            }
                        },
                        revenue: { $sum: "$service.price" },
                        count: { $sum: 1 }
                    }
                },
                { 
                    $sort: { "_id": 1 } 
                },
                {
                    $project: {
                        date: "$_id",
                        revenue: 1,
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            // Add debug information to response
            return NextResponse.json({
                summary: {
                    totalRevenue: summary.totalRevenue,
                    totalAppointments: totalCount, // Use the verified count
                    newClients: summary.uniqueClients.length,
                },
                charts: {
                    serviceDistribution,
                    weeklyRevenue: {
                        labels: weeklyRevenue.map(item => item.date),
                        data: weeklyRevenue.map(item => item.revenue),
                        counts: weeklyRevenue.map(item => item.count) // Added counts for reference
                    }
                }
            });

        } catch (aggregateError) {
            console.error("[REPORTS_AGGREGATE]", aggregateError);
            return new NextResponse("Error generating reports", { status: 500 });
        }
    } catch (error) {
        console.error("[SALON_OWNER_REPORTS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
