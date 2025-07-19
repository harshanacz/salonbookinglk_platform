"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Calendar, Clock, Search, XCircle, AlertCircle,
} from "lucide-react";

export default function ManageAppointments() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments from API
  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      try {
        // First get the salon context to find the salon owner user ID
        const salonResponse = await fetch('/api/salon-owner/salon-profile');
        if (!salonResponse.ok) {
          throw new Error('Failed to get salon profile');
        }
        const salonData = await salonResponse.json();
        
        // Use the userId from salon context (this is the User._id that appointments.salonId references)
        const appointmentsResponse = await fetch(`/api/appointments?salonId=${salonData.userId}`);
        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData.appointments || []);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  // Cancel appointment handler
  const handleCancelAppointment = async (id: string) => {
    // Update in DB
    await fetch(`/api/appointments`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CANCELLED" }),
    });
    // Update in UI
    setAppointments(
      appointments.map((appointment) =>
        appointment._id === id
          ? { ...appointment, status: "CANCELLED" }
          : appointment
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-gray-600 bg-gray-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      case "CONFIRMED":
        return "text-green-600 bg-green-50";
      case "COMPLETED":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Filter and search
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesFilter = filter === "all" || appointment.status === filter;
    const clientName =
      appointment.clientId?.name || appointment.clientName || "";
    const serviceName =
      appointment.serviceId?.name || appointment.service || "";
    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchQuery.toLowerCase());
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments found</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {appointment.clientId?.name || "Unknown"}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        {appointment.status.charAt(0) +
                          appointment.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-semibold">Service:</span>{" "}
                      {appointment.serviceId?.name || "Service"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {String(Math.floor(appointment.time / 100)).padStart(2, "0")}:
                        {String(appointment.time % 100).padStart(2, "0")}
                      </div>
                      <div className="flex items-center gap-1">
                        💳
                        <span>
                          {appointment.paymentMethod
                            ? appointment.paymentMethod.charAt(0) +
                              appointment.paymentMethod.slice(1).toLowerCase()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    {appointment.staffId && (
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold">Professional:</span>{" "}
                        {appointment.staffId?.name || appointment.staffId}
                      </div>
                    )}
                    {appointment.note && (
                      <div className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold">Note:</span> {appointment.note}
                      </div>
                    )}
                  </div>
                  {appointment.status !== "CANCELLED" && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}