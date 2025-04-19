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
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function ManageAppointments() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample appointments data with useState to make it mutable
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      clientName: "Sarah Johnson",
      service: "Haircut & Styling",
      date: "2024-04-10",
      time: "10:00 AM",
      status: "pending",
      phone: "+94 71 234 5678",
    },
    {
      id: 2,
      clientName: "Michael Brown",
      service: "Hair Coloring",
      date: "2024-04-10",
      time: "11:30 AM",
      status: "pending",
      phone: "+94 71 987 6543",
    },
    {
      id: 3,
      clientName: "Emily Davis",
      service: "Manicure & Pedicure",
      date: "2024-04-10",
      time: "2:00 PM",
      status: "cancelled",
      phone: "+94 71 456 7890",
    },
  ]);

  // Function to handle cancelling an appointment
  const handleCancelAppointment = (id:number) => {
    setAppointments(
      appointments.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "cancelled" }
          : appointment
      )
    );
  };

  const getStatusColor = (status:string) => {
    switch (status) {
      case "pending":
        return "text-gray-600 bg-gray-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesFilter = filter === "all" || appointment.status === filter;
    const matchesSearch =
      appointment.clientName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>View and manage all appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Appointments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{appointment.clientName}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusIcon(appointment.status)}
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600">{appointment.service}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {appointment.time}
                    </div>
                  </div>
                </div>

                {/* Only show Cancel button if not already cancelled */}
                {appointment.status !== "cancelled" && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}