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
import { Calendar, Clock, DollarSign, Search, User, FileText } from "lucide-react";

interface Bill {
  id: string;
  customerName: string;
  customerEmail: string;
  services: string[];
  date: string;
  time: string;
  amount: number;
  paymentMethod: string;
  status: string;
  appointmentStatus: string;
  staffName: string;
  note: string;
}

interface BillStats {
  totalRevenue: number;
  paidBillsCount: number;
  pendingBillsCount: number;
  paidAmount: number;
  pendingAmount: number;
  totalTransactions: number;
}

export default function SummaryBillPage() {
  const [dateRange, setDateRange] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<BillStats>({
    totalRevenue: 0,
    paidBillsCount: 0,
    pendingBillsCount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBills();
  }, [dateRange, searchQuery]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        dateRange,
        search: searchQuery
      });

      const response = await fetch(`/api/salon-owner/summary-bills?${params}`, {
        method: "GET",
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBills(data.bills || []);
      setStats(data.stats || {
        totalRevenue: 0,
        paidBillsCount: 0,
        pendingBillsCount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalTransactions: 0
      });
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError("Failed to load bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateBillStatus = async (billId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/salon-owner/summary-bills/${billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setBills(bills.map(bill => 
        bill.id === billId ? { 
          ...bill, 
          status: newStatus === 'COMPLETED' ? 'paid' : 'pending',
          appointmentStatus: newStatus 
        } : bill
      ));
      
      // Refresh stats
      fetchBills();
    } catch (error) {
      console.error("Error updating bill status:", error);
      alert("Failed to update bill status. Please try again.");
    }
  };

  const downloadReport = () => {
    // Create CSV content
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Customer Name,Service,Date,Time,Amount,Status,Payment Method,Staff,Note\n" +
      bills.map(bill => 
        `"${bill.customerName}","${bill.services.join('; ')}","${bill.date}","${bill.time}","${bill.amount}","${bill.status}","${bill.paymentMethod}","${bill.staffName}","${bill.note}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `summary_bills_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Summary Bill</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchBills} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Summary Bill</h1>
        
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
              LKR {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalTransactions} transactions
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
              {stats.paidBillsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              LKR {stats.paidAmount.toLocaleString()}
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
              {stats.pendingBillsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              LKR {stats.pendingAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills List */}
      <Card>
        <CardHeader>
          <CardTitle>Venue Payment Bills</CardTitle>
          <CardDescription>
            Bills for appointments with venue payment method only
          </CardDescription>
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
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
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
                  
                  <div className="space-y-1">
                    <p className="text-gray-600 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {bill.services.join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Staff: {bill.staffName}
                    </p>
                    {bill.note && (
                      <p className="text-sm text-gray-500 italic">
                        Note: {bill.note}
                      </p>
                    )}
                  </div>
                  
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      alert(`Bill Details:\n\nCustomer: ${bill.customerName}\nEmail: ${bill.customerEmail}\nServices: ${bill.services.join(', ')}\nDate: ${bill.date}\nTime: ${bill.time}\nAmount: LKR ${bill.amount.toLocaleString()}\nStaff: ${bill.staffName}\nStatus: ${bill.status}\nNote: ${bill.note || 'No notes'}`);
                    }}
                  >
                    View Details
                  </Button>
                  {bill.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                      onClick={() => updateBillStatus(bill.id, "COMPLETED")}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {bills.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No venue payment bills found for the selected period
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}