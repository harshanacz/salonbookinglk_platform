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

// JSON data for the card grid
const cardData = [
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
];

const Page = () => {
  return (
    <div className="min-h-screen w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Service Approvals and New Salons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Service Approvals</CardTitle>
            <CardDescription>Services pending approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[var(--superAccent)] flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">
                        Custom Hair Coloring {i}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Salon Amaya
                      </div>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/admin/service-cards/${i}`}>Review</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Salons</CardTitle>
            <CardDescription>Recently registered salons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Salon Elegance",
                  location: "Colombo 7",
                  date: "2 days ago",
                },
                {
                  name: "Beauty Hub",
                  location: "Nugegoda",
                  date: "3 days ago",
                },
                {
                  name: "Glamour Studio",
                  location: "Mount Lavinia",
                  date: "5 days ago",
                },
                {
                  name: "Style Masters",
                  location: "Dehiwala",
                  date: "1 week ago",
                },
                {
                  name: "Trendy Cuts",
                  location: "Rajagiriya",
                  date: "1 week ago",
                },
              ].map((salon, i) => (
                <div
                  key={i}
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
