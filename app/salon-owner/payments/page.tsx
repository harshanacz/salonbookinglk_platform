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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, Search, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  appointmentId: string;
  client: string;
  clientEmail: string;
  service: string;
  amount: number;
  date: string;
  status: string;
  method: string;
  paymentIntentId?: string;
  note?: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch payments from API
  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments based on search and status
  useEffect(() => {
    let filtered = [...payments];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (payment) =>
          payment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payment.amount.toString().includes(searchQuery) ||
          payment.clientEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (payment) => payment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Date filter
    if (date) {
      filtered = filtered.filter(
        (payment) => {
          try {
            const paymentDate = new Date(payment.date);
            return format(paymentDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
          } catch {
            return false;
          }
        }
      );
    }

    setFilteredPayments(filtered);
  }, [payments, searchQuery, statusFilter, date]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('/api/salon-owner/payments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched payments:', data);
      
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalRevenue = filteredPayments
    .filter(p => p.status === 'Completed')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const pendingAmount = filteredPayments
    .filter(p => p.status === 'Pending')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const completedCount = filteredPayments.filter(p => p.status === 'Completed').length;
  const failedCount = filteredPayments.filter(p => p.status === 'Failed').length;

  const handleExportReport = () => {
    if (filteredPayments.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const csvContent = [
      ['Client', 'Service', 'Amount (LKR)', 'Date', 'Status', 'Payment Method'],
      ...filteredPayments.map(payment => [
        payment.client,
        payment.service,
        payment.amount?.toString() || '0',
        payment.date ? format(new Date(payment.date), 'yyyy-MM-dd') : '',
        payment.status,
        payment.method
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-lg">Loading payments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Payments</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            onClick={fetchPayments} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportReport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <Button 
            onClick={fetchPayments} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {completedCount} completed payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR {pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter(p => p.status === 'Pending').length} pending transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Successful transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Failed Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCount}</div>
            <p className="text-xs text-muted-foreground">Failed transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View and manage your salon payments ({payments.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, service, or amount..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {payments.length === 0 
                ? "No payments found. Start by creating some appointments!" 
                : "No payments found matching your criteria."
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{payment.client}</div>
                          <div className="text-sm text-gray-500">{payment.clientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.service}</TableCell>
                      <TableCell>LKR {(payment.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {payment.date ? format(new Date(payment.date), "MMM d, yyyy") : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            payment.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            alert(`Appointment ID: ${payment.appointmentId}\nPayment ID: ${payment.paymentIntentId || 'N/A'}\nNote: ${payment.note || 'No notes'}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}