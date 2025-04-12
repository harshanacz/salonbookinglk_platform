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
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { format } from "date-fns";

const appointments = [
  {
    id: 1,
    client: "John Doe",
    service: "Haircut",
    staff: "Dhanuka",
    date: "2024-01-15",
    time: "10:00 AM",
    status: "Confirmed",
  },
  {
    id: 2,
    client: "Jane Smith",
    service: "Hair Coloring",
    staff: "Samantha",
    date: "2024-01-15",
    time: "11:30 AM",
    status: "Pending",
  },
  {
    id: 3,
    client: "Alice Johnson",
    service: "Manicure",
    staff: "Priyanka",
    date: "2024-01-16",
    time: "2:00 PM",
    status: "Completed",
  },
  {
    id: 4,
    client: "Bob Brown",
    service: "Facial",
    staff: "Nimal",
    date: "2024-01-16",
    time: "3:30 PM",
    status: "Cancelled",
  },
  {
    id: 5,
    client: "Eva Green",
    service: "Pedicure",
    staff: "Kumari",
    date: "2024-01-17",
    time: "9:00 AM",
    status: "Confirmed",
  },
];

export default function AppointmentsPage() {
  const [date, setDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.staff.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Appointments</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Appointments</CardTitle>
          <CardDescription>
            View and manage your salon appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
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
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.client}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{appointment.staff}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.date), "MMM d, yyyy")} at{" "}
                    {appointment.time}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
