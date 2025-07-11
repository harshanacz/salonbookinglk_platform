"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  User,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Interface for client data
interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings?: number;
  totalSpent?: number;
  lastVisit?: string;
  avatar?: string;
  joinDate?: string;
  membershipStatus?: string;
  favoriteServices?: string;
  preferredSalon?: string;
}

// Interface for booking data
interface Booking {
  id: string | number;
  date: string;
  time: string;
  salon: string;
  service: string;
  price: number;
  status: string;
}

export default function ClientDetailsPage(
  props: {
    params: { id: string };
  }
) {
  const { params } = props;
  const clientId = params.id;
  const [client, setClient] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format time from minutes
  const formatTimeFromMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch client data
        const response = await fetch(`/api/admin/users/${clientId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch client: ${response.statusText}`);
        }        const data = await response.json();
        console.log("Client data:", data); // Log client data for debugging
        
        setClient({
          _id: data._id,
          name: data.userName || 'N/A',
          email: data.email || 'N/A',
          phone: data.mobileNumber || 'N/A',
          totalBookings: data.totalBookings || 0,
          totalSpent: data.totalSpent || 0,
          lastVisit: data.lastVisit,          avatar: data.profileImage,
          // Extract additional client details
          joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : undefined,
          membershipStatus: data.userType || "",
          favoriteServices: data.favoriteServices || data.preferredServices,
          preferredSalon: data.preferredSalon || data.favoriteSalon,
        });// Fetch bookings for this client
        try {
          // Change clientId to userId in the API query parameter
          const bookingsResponse = await fetch(`/api/admin/appointments?userId=${clientId}`);
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            console.log("API Response:", bookingsData); // Log the actual response for debugging
            
            // Check if we have appointments data and log it for debugging
            if (bookingsData.appointments && bookingsData.appointments.length > 0) {
              console.log("First appointment structure:", bookingsData.appointments[0]);
            }
            
            // Transform appointments data to match the Booking interface
            const formattedBookings = bookingsData.appointments?.map((appointment: any) => ({
              id: appointment._id,
              date: new Date(appointment.date).toLocaleDateString(),
              time: formatTimeFromMinutes(appointment.time),
              salon: appointment.salonId?.userName || 'Unknown Salon',
              service: appointment.serviceId?.title || 'Unknown Service',
              price: appointment.serviceId?.price || 0,
              status: appointment.status,
            })) || [];
            
            console.log("Formatted bookings:", formattedBookings);
            setBookings(formattedBookings);
          } else {
            console.log("API Error:", bookingsResponse.status, bookingsResponse.statusText);            setBookings([]);
          }
        } catch (bookingError) {
          // If no booking endpoint exists yet, we'll just show empty bookings
          console.error("Could not fetch bookings:", bookingError);
          setBookings([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to load client data");
      } finally {
        setLoading(false);
      }
    }

    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/admin/clients">Back to clients</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p>Client not found</p>
        <Button asChild className="mt-4">
          <Link href="/admin/clients">Back to clients</Link>
        </Button>
      </div>
    );
  }  // Calculate client stats based on the fetched bookings data
  const totalBookings = client.totalBookings;
  const totalSpent = client.totalSpent;
  const lastVisit = client.lastVisit;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Client Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-full p-4 flex flex-col justify-center items-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={client.avatar || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-center">{client.name}</h2>
          <div className="mt-4 space-y-2 text-center">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" /> {client.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" /> {client.phone}
            </p>
          </div>
        </Card>

        <Card className="md:col-span-2 h-full p-6">
          <CardHeader>
            <CardTitle>Client Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-muted p-6 rounded-lg text-center">
              <Calendar className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <DollarSign className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">
                LKR {(totalSpent ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <Clock className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
              <p className="text-sm text-muted-foreground">Last Active</p>
              <p className="text-2xl font-bold">
                {lastVisit}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>      {/* Client Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Client Additional Information</CardTitle>
          <CardDescription>
            Additional details about this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span> {client.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span> {client.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span> {client.phone}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Membership Information</h3>                <div className="mt-2 space-y-2">                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Member Since:</span> {client.joinDate || "Not available"}
                  </div>
                  {client.membershipStatus && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{client.membershipStatus}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Preferences</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Favorite Services:</span> {client.favoriteServices || "Not specified"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Preferred Salon:</span> {client.preferredSalon || "Not specified"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
