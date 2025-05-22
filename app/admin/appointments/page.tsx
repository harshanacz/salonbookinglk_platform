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
import { CalendarIcon, ChevronDown, Search, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// Import enums directly to avoid issues with mongoose model imports on client side
enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  ONLINE = "ONLINE",
}

interface AppointmentData {
  _id: string;
  clientId: {
    _id: string;
    userName: string;
    email: string;
    phone: string;
  };
  salonId: {
    _id: string;
    userName: string;
  };
  serviceId: {
    _id: string;
    title: string;
    price: number;
  };
  staffId?: {
    _id: string;
    name: string;
  };
  date: string;
  time: number;
  note?: string;
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminAppointmentsPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTimeFromMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      
      if (date) {
        params.append("date", date.toISOString().split('T')[0]);
      }
      
      if (status && status !== "all") {
        params.append("status", status);
      }
      
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/admin/appointments?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.appointments) {
        throw new Error("No appointment data received");
      }
      
      setAppointments(data.appointments);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [pagination.page, pagination.limit, date, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchAppointments();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? undefined : value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setDate(undefined);
    setStatus(undefined);
    setSearchQuery("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointments</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>
            View and manage appointments across all salons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 space-x-0 md:space-x-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-[180px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select onValueChange={handleStatusChange} value={status || "all"}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={AppointmentStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={AppointmentStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {(date || status || searchQuery) && (
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading appointments...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchAppointments} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No appointments found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Salon</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>                    {appointments.map((appointment) => (
                      <TableRow key={appointment._id}>
                        <TableCell>{appointment.clientId.userName}</TableCell>
                        <TableCell>{appointment.salonId.userName}</TableCell>
                        <TableCell>{appointment.serviceId.title}</TableCell>
                        <TableCell>{appointment.staffId?.name || '-'}</TableCell>
                        <TableCell>
                          {format(new Date(appointment.date), "MMM d, yyyy")} at{" "}
                          {formatTimeFromMinutes(appointment.time)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              appointment.status === AppointmentStatus.CONFIRMED
                                ? "default"
                                : appointment.status === AppointmentStatus.PENDING
                                ? "pending"
                                : appointment.status === AppointmentStatus.COMPLETED
                                ? "secondary"
                                : appointment.status === AppointmentStatus.CANCELLED
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm">
                            <Link href={`/admin/appointments/${appointment._id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} appointments
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}