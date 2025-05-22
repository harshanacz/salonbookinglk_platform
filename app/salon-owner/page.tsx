"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  DollarSign,
  Users,
  Scissors,
  TrendingUp,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SalonOwnerDashboard() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [dashboardData, setDashboardData] = useState({
    services: { active: 0, pending: 0 },
    staff: { total: 0, newThisMonth: 0 },
    appointments: {
      total: 0,
      lastMonth: 0,
      today: [] as any[],
    },
    popularServices: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/salon-owner/dashboard");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Dashboard data received:", data); // Debug log
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const revenueData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue",
        data: [1200, 1900, 1500, 2500, 2200, 3000, 2800],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const appointmentsData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Appointments",
        data: [15, 22, 18, 25, 30, 35, 28],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/salon-owner/services/create">Add New Service</Link>
          </Button>
          <Button className="w-full sm:w-auto" variant="outline" asChild>
            <Link href="/salon-owner/staff/create">Add Staff Member</Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full sm:w-auto"
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
              
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out of your account. You will need to sign in again to access your dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : dashboardData.appointments.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${dashboardData.appointments.lastMonth} in last month`}
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Services
            </CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : dashboardData.services.active}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${dashboardData.services.pending} pending approval`}
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : dashboardData.staff.total}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${dashboardData.staff.newThisMonth} added this month`}
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 45,231</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
            <CardDescription>Revenue trend for the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trend</CardTitle>
            <CardDescription>
              Daily appointments for the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Line data={appointmentsData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading appointments..."
                : dashboardData.appointments.today.length > 0
                ? `${dashboardData.appointments.today.length} new appointments created today`
                : "No new appointments created today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isLoading && dashboardData.appointments.today.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  No appointments created today
                </div>
              ) : (
                dashboardData.appointments.today.map((appointment: any) => (
                  <div
                    key={appointment._id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {appointment.clientId?.name || "Client"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.serviceId?.name || "Service"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(appointment.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">Created today</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
            <CardDescription>
              Based on bookings in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isLoading && dashboardData.popularServices.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  No service bookings in the last 30 days
                </div>
              ) : (
                dashboardData.popularServices.map((service: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Scissors className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">
                          {service.count} bookings
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {service.trend}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
