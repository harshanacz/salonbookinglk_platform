"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, Users, Scissors, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

// Custom hook for count up animation
const useCountUp = (end: number, start = 0, duration = 500) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset start time when end value changes
    startTimeRef.current = null;
    countRef.current = start;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min(
        (timestamp - startTimeRef.current) / duration,
        1
      );
      const currentCount = Math.floor(progress * (end - start) + start);

      setCount(currentCount);
      countRef.current = currentCount;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);

    return () => {
      startTimeRef.current = null;
    };
  }, [end, start, duration]);

  return count;
};

// Sample data for the dashboard with placeholders for dynamic values
const dashboardData = {
  stats: [
    {
      id: 1,
      title: "Total Salons",
      icon: Store,
      value: 0,
      description: "",
    },
    {
      id: 2,
      title: "Pending Services",
      icon: Scissors,
      value: 0, 
      description: "",
    },
    {
      id: 3,
      title: "Total Users",
      icon: Users,
      value: 0, 
      description: "",
    },
    {
      id: 4,
      title: "Active Complaints",
      icon: AlertTriangle,
      value: 0,
      description: "0 resolved today",
    },
  ],
};

const Page = () => {
  const [recentSalons, setRecentSalons] = useState<any[]>([]);
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [stats, setStats] = useState(dashboardData.stats);
  const [lastMonthSalons, setLastMonthSalons] = useState(0);
  const [pendingServicesCount, setPendingServicesCount] = useState(0);
  const [newServicesToday, setNewServicesToday] = useState(0);

  useEffect(() => {
    // Debug flag to track API calls completion
    const apiCalls = {
      salons: false,
      services: false,
      users: false,
      recentSalons: false
    };
    
    // Helper function to log API status
    const logApiStatus = () => {
      if (apiCalls.salons && apiCalls.services && apiCalls.users && apiCalls.recentSalons) {
        console.log("All API calls completed. Stats data:", stats);
      }
    };    const fetchRecentSalons = async () => {
      try {
        console.log("Fetching recent salons...");
        const response = await fetch(
          "/api/admin/users?type=SALON_OWNER&limit=5&sort=-createdAt"
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Recent salons response:", data);
          // Extract users array from response
          const salons = Array.isArray(data.users) ? data.users : 
                        (Array.isArray(data) ? data : []);

          // Process salon data to ensure consistent structure
          const processedSalons = salons.map((salon: any) => ({
            ...salon,
            name:
              salon.salonName ||
              salon.businessName ||
              salon.name ||
              salon.email?.split("@")[0] ||
              "Unnamed Salon",
            address:
              salon.salonAddress ||
              salon.businessAddress ||
              salon.address ||
              "No address provided",
          }));

          setRecentSalons(processedSalons);
        } else {
          console.error("Failed to fetch recent salons, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching salon data:", error);
      } finally {
        setLoading(false);
        apiCalls.recentSalons = true;
        logApiStatus();
      }
    };    const fetchSalonsCount = async () => {
      try {
        const response = await fetch("/api/admin/users?type=SALON_OWNER&limit=all");
        if (response.ok) {
          const data = await response.json();
          console.log("Salon count API response:", data); // Log the response for debugging
          
          // Ensure we have a valid array of salons
          const salons = Array.isArray(data.users) ? data.users : [];
          const totalSalons = salons.length;

          // Calculate salons created in the current calendar month
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const newSalons = salons.filter(
            (salon: any) => new Date(salon.createdAt) >= startOfMonth
          ).length;
          setLastMonthSalons(newSalons);

          // Prepare a more informative description
          let description = "No new salons this month";
          if (newSalons > 0) {
            description = `${newSalons} new ${newSalons === 1 ? 'salon' : 'salons'} this month`;
          }

          // Update the stats with proper value and description
          setStats((prevStats) =>
            prevStats.map((stat) =>
              stat.id === 1
                ? {
                    ...stat,
                    value: totalSalons,
                    description: description,
                  }
                : stat
            )
          );
          
          console.log("Updated total salons:", totalSalons); 
        } else {
          console.error("Failed to fetch salon count, status:", response.status);
          // Set fallback description for error case
          setStats((prevStats) =>
            prevStats.map((stat) =>
              stat.id === 1
                ? {
                    ...stat,
                    description: "Unable to fetch salon data",
                  }
                : stat
            )
          );
        }
      } catch (error) {        console.error("Error fetching salon count:", error);
        // Set fallback description for error case
        setStats((prevStats) =>
          prevStats.map((stat) =>
            stat.id === 1
              ? {
                  ...stat,
                  description: "Error loading salon data",
                }
              : stat
          )
        );
      } finally {
        apiCalls.salons = true;
        logApiStatus();
      }
    };const fetchUsersCount = async () => {
      try {
        // Fetch all users and filter them by type
        const response = await fetch("/api/admin/users?limit=all");
        if (response.ok) {
          const data = await response.json();
          console.log("Users API response:", data); 
          
          let users = [];
          if (Array.isArray(data)) {
            users = data;
          } else if (data && typeof data === 'object') {
            users = data.users || [];
          }
          
          console.log("Extracted users array:", users);
          
          // Count salon owners and clients only (exclude admins)
          const salonOwners = users.filter((user: any) => 
            user.role === "SALON_OWNER" || user.type === "SALON_OWNER"
          ).length;
          
          const clients = users.filter((user: any) => 
            user.role === "CUSTOMER" || user.type === "CUSTOMER"
          ).length;
          
          const totalUsers = salonOwners + clients;
          
          console.log(`Found ${salonOwners} salon owners and ${clients} clients, total: ${totalUsers}`);

          // Calculate users registered this month
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const newUsersThisMonth = users.filter((user: any) => 
            (user.role === "SALON_OWNER" || user.type === "SALON_OWNER" || 
             user.role === "CUSTOMER" || user.type === "CUSTOMER") &&
            new Date(user.createdAt) >= startOfMonth
          ).length;

          // Only update if we have actual values
          if (totalUsers > 0 || users.length > 0) {
            const description = newUsersThisMonth > 0 
              ? `${newUsersThisMonth} new ${newUsersThisMonth === 1 ? 'user' : 'users'} this month`
              : "No new users this month";
              
            setStats((prevStats) =>
              prevStats.map((stat) =>
                stat.id === 3
                  ? {
                      ...stat,
                      value: totalUsers,
                      description: description,
                    }
                  : stat
              )
            );
          } else {
            // If no users found but API succeeded, set a meaningful message
            setStats((prevStats) =>
              prevStats.map((stat) =>
                stat.id === 3
                  ? {
                      ...stat,
                      description: "No users found in system",
                    }
                  : stat
              )
            );
          }
        } else {
          console.error("Failed to fetch users count, status:", response.status);
          setStats((prevStats) =>
            prevStats.map((stat) =>
              stat.id === 3
                ? {
                    ...stat,
                    description: "Failed to load user data",
                  }
                : stat
            )
          );
        }
      } catch (error) {
        console.error("Error fetching users count:", error);
        setStats((prevStats) =>
          prevStats.map((stat) =>
            stat.id === 3
              ? {
                  ...stat,
                  description: "Error loading user data",
                }
              : stat
          )
        );
      } finally {
        apiCalls.users = true;
        logApiStatus();
      }
    };const fetchPendingServices = async () => {
      try {
        const response = await fetch("/api/admin/service-cards?limit=all");
        if (response.ok) {
          const data = await response.json();
          // Limit to the 5 most recent services for display
          setPendingServices(data.slice(0, 5));

          // Update total pending services count
          const totalPending = data.length;
          setPendingServicesCount(totalPending);

          // Calculate services created today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const newToday = data.filter((service: any) => {
            const serviceDate = new Date(service.startedDate);
            return serviceDate >= today;
          }).length;

          setNewServicesToday(newToday);

          // Update the stats
          setStats((prevStats) =>
            prevStats.map((stat) =>
              stat.id === 2
                ? {
                    ...stat,
                    value: totalPending,
                    description:
                      newToday > 0
                        ? `${newToday} new today`
                        : "No new services today",
                  }
                : stat
            )
          );
        } else {
          console.error("Failed to fetch pending services");
        }
      } catch (error) {
        console.error("Error fetching service data:", error);      } finally {
        setServicesLoading(false);
        apiCalls.services = true;
        logApiStatus();
      }
    };

    fetchRecentSalons();
    fetchPendingServices();
    fetchSalonsCount();
    fetchUsersCount();
  }, []);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} week${
      Math.floor(diffDays / 7) > 1 ? "s" : ""
    } ago`;
  };

  return (
    <div className="min-h-screen w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          // Use the count up animation hook
          const animatedValue = useCountUp(stat.value, 0, 1500);

          return (
            <Card key={stat.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {animatedValue}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description || (loading ? "Loading data..." : "No data available")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Approvals and New Salons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Services */}
        <Card>
          <CardHeader>
            <CardTitle>Service Approvals</CardTitle>
            <CardDescription>Services pending approval</CardDescription>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="py-6 text-center">Loading services...</div>
            ) : pendingServices.length > 0 ? (
              <div className="space-y-4">
                {pendingServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-[var(--superAccent)] flex items-center justify-center">
                        <Scissors className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{service.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.email}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/admin/service-cards/${service.id}`}>
                        Review
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">No pending services found</div>
            )}
          </CardContent>
        </Card>

        {/* New Salons */}
        <Card>
          <CardHeader>
            <CardTitle>New Salons</CardTitle>
            <CardDescription>Recently registered salons</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-6 text-center">Loading salons...</div>
            ) : recentSalons.length > 0 ? (
              <div className="space-y-4">
                {recentSalons.map((salon) => (
                  <div
                    key={salon._id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--superAccent)] flex items-center justify-center">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{salon.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {salon.email || "No email"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {salon.address}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(salon.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">No salons found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
