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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, DollarSign, Search } from "lucide-react";

export default function SummaryBillPage() {
  const [dateRange, setDateRange] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample bills data
  const bills = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      services: ["Haircut & Styling", "Hair Treatment"],
      date: "2024-04-10",
      time: "11:30 AM",
      amount: 7500,
      paymentMethod: "Card",
      status: "paid",
    },
    {
      id: 2,
      customerName: "Michael Brown",
      services: ["Hair Coloring"],
      date: "2024-04-10",
      time: "2:00 PM",
      amount: 12000,
      paymentMethod: "Cash",
      status: "paid",
    },
    {
      id: 3,
      customerName: "Emily Davis",
      services: ["Manicure & Pedicure", "Facial"],
      date: "2024-04-10",
      time: "3:30 PM",
      amount: 9500,
      paymentMethod: "Card",
      status: "pending",
    },
  ];

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = bills.filter((bill) => bill.status === "paid");
  const pendingBills = bills.filter((bill) => bill.status === "pending");

  const filteredBills = bills.filter(
    (bill) =>
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.services.some((service) =>
        service.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Summary Bill</h1>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              LKR {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {bills.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidBills.length}
            </div>
            <p className="text-xs text-muted-foreground">
              LKR{" "}
              {paidBills
                .reduce((sum, bill) => sum + bill.amount, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingBills.length}
            </div>
            <p className="text-xs text-muted-foreground">
              LKR{" "}
              {pendingBills
                .reduce((sum, bill) => sum + bill.amount, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>View and manage all bills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{bill.customerName}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        bill.status === "paid"
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {bill.services.join(", ")}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {bill.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {bill.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      LKR {bill.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {bill.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredBills.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No bills found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
