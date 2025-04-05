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

// Sample data for the dashboard
const dashboardData = {
  stats: [
    {
      id: 1,
      title: "Total Salons",
      icon: Store,
      value: 48,
      description: "+3 new this month",
    },
    {
      id: 2,
      title: "Pending Services",
      icon: Scissors,
      value: 24,
      description: "12 new today",
    },
    {
      id: 3,
      title: "Total Users",
      icon: Users,
      value: 1284,
      description: "+18% from last month",
    },
    {
      id: 4,
      title: "Active Complaints",
      icon: AlertTriangle,
      value: 7,
      description: "3 resolved today",
    },
  ],
  pendingServices: [
    {
      id: 101,
      name: "Custom Hair Coloring",
      salon: "Salon Amaya",
      status: "pending",
    },
    {
      id: 102,
      name: "Premium Beard Trim",
      salon: "Gentleman's Grooming",
      status: "pending",
    },
    {
      id: 103,
      name: "Keratin Treatment",
      salon: "Hair Studio",
      status: "pending",
    },
    {
      id: 104,
      name: "Kids Haircut",
      salon: "Tiny Cuts",
      status: "pending",
    },
    {
      id: 105,
      name: "Bridal Makeup",
      salon: "Glamour Studio",
      status: "pending",
    },
  ],
  newSalons: [
    {
      id: 201,
      name: "Salon Elegance",
      location: "Colombo 7",
      date: "2 days ago",
    },
    {
      id: 202,
      name: "Beauty Hub",
      location: "Nugegoda",
      date: "3 days ago",
    },
    {
      id: 203,
      name: "Glamour Studio",
      location: "Mount Lavinia",
      date: "5 days ago",
    },
    {
      id: 204,
      name: "Style Masters",
      location: "Dehiwala",
      date: "1 week ago",
    },
    {
      id: 205,
      name: "Trendy Cuts",
      location: "Rajagiriya",
      date: "1 week ago",
    },
  ],
};

const Page = () => {
  return (
    <div className="min-h-screen w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
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
            <CardTitle>Recent Service Approvals</CardTitle>
            <CardDescription>Services pending approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.pendingServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[var(--superAccent)] flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.salon}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/admin/service-cards/${service.id}`}>Review</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Salons */}
        <Card>
          <CardHeader>
            <CardTitle>New Salons</CardTitle>
            <CardDescription>Recently registered salons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.newSalons.map((salon) => (
                <div
                  key={salon.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--superAccent)] flex items-center justify-center">
                      <Store className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{salon.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {salon.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {salon.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;