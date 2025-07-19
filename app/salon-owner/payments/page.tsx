"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  client: string;
  service: string;
  amount: number;
  date: string;
  status: string;
  method: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  revenueChange: string;
  pendingCount: number;
  completedChange: string;
  failedChange: string;
}

const initialStats: PaymentStats = {
  totalRevenue: 0, pendingPayments: 0, completedPayments: 0,
  failedPayments: 0, revenueChange: "+0%", pendingCount: 0,
  completedChange: "+0", failedChange: "0"
};

export default function PaymentsPage() {
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/salon-owner/payments");
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setPaymentStats(data.stats || initialStats);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !date || format(new Date(payment.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesDate && matchesStatus;
  });

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/salon-owner/payment/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setPayments(payments.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
        fetchPayments(); // Refresh stats
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderStatCard = (title: string, value: string | number, subtext: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {renderStatCard("Total Revenue", `LKR ${paymentStats.totalRevenue.toLocaleString()}`, 
          `${paymentStats.revenueChange} from last month`)}
        {renderStatCard("Pending Payments", `LKR ${paymentStats.pendingPayments.toLocaleString()}`, 
          `${paymentStats.pendingCount} pending transactions`)}
        {renderStatCard("Completed Payments", paymentStats.completedPayments, 
          `${paymentStats.completedChange} from yesterday`)}
        {renderStatCard("Failed Payments", paymentStats.failedPayments, 
          `${paymentStats.failedChange} from last week`)}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                {["all", "completed", "pending", "failed"].map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading payments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {["Client", "Service", "Amount", "Date", "Status", "Payment Method", "Actions"]
                    .map(header => <TableHead key={header}>{header}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchQuery || date || statusFilter !== "all" 
                        ? "No payments found matching your criteria."
                        : "No payments recorded yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.client}</TableCell>
                      <TableCell>{payment.service}</TableCell>
                      <TableCell>LKR {payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`bg-${payment.status.toLowerCase()}-100 
                          text-${payment.status.toLowerCase()}-800`}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        {payment.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updatePaymentStatus(payment.id, "Completed")}
                              className="bg-green-600 hover:bg-green-700">Mark Paid</Button>
                            <Button size="sm" variant="outline" 
                              onClick={() => updatePaymentStatus(payment.id, "Failed")}
                              className="border-red-300 text-red-600 hover:bg-red-50">Mark Failed</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}