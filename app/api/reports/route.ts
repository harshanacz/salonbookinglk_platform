import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Appointment from "@/models/Appointment";
import User, { UserType } from "@/models/User";
import dbConnect from "@/lib/mongodb";

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
        const selectedService = searchParams.get('service');

        // Current period query
        const currentMatchQuery = {
            salonId: user._id,
            ...(fromDate && toDate && {
                createdAt: {
                    $gte: fromDate,
                    $lte: new Date(toDate.setHours(23, 59, 59, 999))
                }
            }),
            ...(selectedService && selectedService !== 'all' && {
                'service.type': selectedService.toUpperCase()
            })
        };

        // Previous period query for comparison
        const periodDays = fromDate && toDate ? 
            Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) : 30;
        
        const previousFromDate = fromDate ? new Date(fromDate.getTime() - (periodDays * 24 * 60 * 60 * 1000)) : undefined;
        const previousToDate = fromDate || undefined;

        const previousMatchQuery = {
            salonId: user._id,
            ...(previousFromDate && previousToDate && {
                createdAt: {
                    $gte: previousFromDate,
                    $lte: previousToDate
                }
            }),
            ...(selectedService && selectedService !== 'all' && {
                'service.type': selectedService.toUpperCase()
            })
        };

        // Get current period stats
        const currentStats = await Appointment.aggregate([
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
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: currentMatchQuery },
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

        // Get previous period stats
        const previousStats = await Appointment.aggregate([
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
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: previousMatchQuery },
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

        // Get popular services
        const popularServices = await Appointment.aggregate([
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
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: currentMatchQuery },
            {
                $group: {
                    _id: "$service.type",
                    count: { $sum: 1 },
                    revenue: { $sum: "$service.price" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
                $project: {
                    service: { $toLower: "$_id" },
                    count: 1,
                    revenue: 1,
                    _id: 0
                }
            }
        ]);

        const current = currentStats[0] || {
            totalRevenue: 0,
            totalAppointments: 0,
            uniqueClients: []
        };

        const previous = previousStats[0] || {
            totalRevenue: 0,
            totalAppointments: 0,
            uniqueClients: []
        };

        // Calculate percentage changes
        const revenueChange = previous.totalRevenue > 0 
            ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
            : current.totalRevenue > 0 ? 1000 : 0; // Show as significant increase if no previous data

        const appointmentsChange = previous.totalAppointments > 0 
            ? ((current.totalAppointments - previous.totalAppointments) / previous.totalAppointments) * 100 
            : current.totalAppointments > 0 ? 1000 : 0;

        const newClientsChange = current.uniqueClients.length - previous.uniqueClients.length;

        return NextResponse.json({
            totalRevenue: current.totalRevenue,
            totalAppointments: current.totalAppointments,
            newClients: current.uniqueClients.length,
            customerSatisfaction: 4.8, // This would come from a reviews collection
            revenueChange,
            appointmentsChange,
            newClientsChange,
            popularServices: popularServices.map(service => ({
                service: service.service || 'unknown',
                count: service.count,
                revenue: service.revenue
            }))
        });

    } catch (error) {
        console.error("[REPORTS_GET]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}