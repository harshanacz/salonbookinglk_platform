"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BarChart,
  CalendarIcon,
  Download,
  LineChart,
  PieChart,
} from "lucide-react";
import { format, subDays } from "date-fns";

// This is a placeholder component for charts. In a real application, you'd use a charting library like recharts or Chart.js
const ChartPlaceholder = ({ type }: { type: string }) => (
  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
    {type === "bar" && <BarChart className="h-12 w-12 text-gray-400" />}
    {type === "line" && <LineChart className="h-12 w-12 text-gray-400" />}
    {type === "pie" && <PieChart className="h-12 w-12 text-gray-400" />}
    <span className="ml-2 text-gray-500">Chart placeholder</span>
  </div>
);

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[300px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="haircut">Haircut</SelectItem>
            <SelectItem value="coloring">Hair Coloring</SelectItem>
            <SelectItem value="manicure">Manicure</SelectItem>
            <SelectItem value="pedicure">Pedicure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 45,231</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">+8 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <p className="text-xs text-muted-foreground">Based on 98 reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="services">Popular Services</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Your revenue trend over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder type="line" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
              <CardDescription>
                Breakdown of appointments by status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder type="bar" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <CardDescription>
                Distribution of services by popularity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartPlaceholder type="pie" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
