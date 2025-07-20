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
  const [error, setError] = useState("");

  // Fetch appointments from API
  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        setError("");
        
        const res = await fetch(`/api/appointments`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Fetched appointments data:", data);
        
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  // Cancel appointment handler
  const handleCancelAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "CANCELLED" }),
      });
      
      if (res.ok) {
        // Update in UI
        setAppointments(
          appointments.map((appointment) =>
            appointment._id === id
              ? { ...appointment, status: "CANCELLED" }
              : appointment
          )
        );
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
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
    
    // Handle different possible field structures
    const clientName = 
      appointment.clientId?.userName || 
      appointment.clientId?.name || 
      appointment.clientName || 
      "Unknown Client";
      
    const serviceName = 
      appointment.serviceId?.title || 
      appointment.serviceId?.name || 
      appointment.service || 
      "Unknown Service";
    
    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Loading appointments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments found</p>
              </div>
            ) : (
              filteredAppointments.map((appointment) => {
                const clientName = 
                  appointment.clientId?.userName || 
                  appointment.clientId?.name || 
                  "Unknown Client";
                  
                const serviceName = 
                  appointment.serviceId?.title || 
                  appointment.serviceId?.name || 
                  "Unknown Service";

                return (
                  <div
                    key={appointment._id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {clientName}
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
                        {serviceName}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {appointment.date
                              ? new Date(appointment.date).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {appointment.time 
                              ? typeof appointment.time === 'number' 
                                ? `${Math.floor(appointment.time / 100)}:${(appointment.time % 100).toString().padStart(2, '0')}`
                                : appointment.time
                              : "N/A"}
                          </span>
                        </div>
                        {appointment.staffId?.name && (
                          <div className="flex items-center gap-1">
                            <span>Staff: {appointment.staffId.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              // Handle confirm appointment
                            }}
                          >
                            Confirm
                          </Button>
                        </>
                      )}
                      {appointment.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelAppointment(appointment._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}