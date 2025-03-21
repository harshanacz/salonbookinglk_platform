"use client";
import Overview from "@/components/admin/Overview";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Scissors, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div className="p-4 min-h-screen w-full space-y-6">
      <div className="sticky top-0 z-10 bg-white rounded-2xl mt-6 md:mt-0">
        <Overview />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Services</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">12 new today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 resolved today</p>
          </CardContent>
        </Card>
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
                <div key={i} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <Scissors className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">Custom Hair Coloring {i}</div>
                      <div className="text-sm text-gray-500">Salon Amaya</div>
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
                { name: "Salon Elegance", location: "Colombo 7", date: "2 days ago" },
                { name: "Beauty Hub", location: "Nugegoda", date: "3 days ago" },
                { name: "Glamour Studio", location: "Mount Lavinia", date: "5 days ago" },
                { name: "Style Masters", location: "Dehiwala", date: "1 week ago" },
                { name: "Trendy Cuts", location: "Rajagiriya", date: "1 week ago" },
              ].map((salon, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Store className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{salon.name}</div>
                      <div className="text-sm text-gray-500">{salon.location}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{salon.date}</div>
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