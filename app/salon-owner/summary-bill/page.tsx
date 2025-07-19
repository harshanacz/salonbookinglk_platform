"use client";

import { useState, useEffect } from "react";
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

interface Bill {
  id: string;
  customerName: string;
  services: string[];
  date: string;
  time: string;
  amount: number;
  paymentMethod: string;
  status: string;
  salonId: string;
  createdAt: string;
  appointmentId?: string;
}

export default function SummaryBillPage() {
  const [dateRange, setDateRange] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bills from API
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching bills from API...');
      
      const response = await fetch('/api/bills', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Bills fetched from API:', data);
      
      setBills(data.bills || []);
      if (data.bills.length === 0) {
      console.log('No bills found, this is normal if no venue payments have been made yet');
    }
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(
        `Failed to load bills: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter bills based on date range
  const filterBillsByDate = (bills: Bill[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return bills.filter(bill => {
      const billDate = new Date(bill.date);
      
      switch (dateRange) {
        case "today":
          return billDate.toDateString() === today.toDateString();
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return billDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return billDate >= monthAgo;
        case "year":
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return billDate >= yearAgo;
        default:
          return true;
      }
    });
  };

  const filteredBills = filterBillsByDate(bills).filter(
    (bill) =>
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.services.some((service) =>
        service.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = filteredBills.filter((bill) => bill.status === "paid");
  const pendingBills = filteredBills.filter((bill) => bill.status === "pending");

  const markAsPaid = async (billId: string) => {
    try {
      const response = await fetch('/api/bills', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billId, status: 'paid' }),
      });

      if (response.ok) {
        // Update local state
        setBills(prevBills => 
          prevBills.map(bill => 
            bill.id === billId 
              ? { ...bill, status: "paid" }
              : bill
          )
        );
      } else {
        throw new Error('Failed to update bill status');
      }
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      alert('Failed to mark bill as paid. Please try again.');
    }
  };

  const createTestBill = async () => {
    try {
      const testBill = {
        customerName: "Test Customer " + Date.now(),
        services: ["Haircut", "Hair Wash"],
        date: new Date().toISOString().split('T')[0],
        time: "10:00 AM",
        amount: 5000,
        paymentMethod: "Cash/Venue",
        status: "pending",
        salonId: "test-salon-1",
        appointmentId: "test-appointment-" + Date.now(),
      };
      
      console.log('Creating test bill:', testBill);
      
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBill),
      });
      
      const result = await response.json();
      console.log('Test bill response:', result);
      
      if (response.ok) {
        alert('Test bill created successfully!');
        fetchBills(); // Refresh the bills
      } else {
        alert('Failed to create test bill');
      }
    } catch (error) {
      console.error('Error creating test bill:', error);
      alert('Error creating test bill');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading bills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 flex-col gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchBills}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Summary Bill</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={createTestBill}
            className="bg-blue-100 hover:bg-blue-200"
          >
            Create Test Bill
          </Button>
          <Button 
            variant="outline" 
            onClick={fetchBills}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Download Report
          </Button>
        </div>
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
              From {filteredBills.length} transactions
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
          <CardTitle>Bills ({bills.length} total)</CardTitle>
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
                    {Array.isArray(bill.services) ? bill.services.join(", ") : bill.services}
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
                      onClick={() => markAsPaid(bill.id)}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {filteredBills.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {bills.length === 0 
                    ? "No bills found. Bills will appear here when customers choose 'Pay at Venue' option." 
                    : "No bills match your search criteria"}
                </p>
                <Button 
                  variant="outline" 
                  onClick={fetchBills}
                  className="mt-2"
                >
                  Refresh Bills
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}