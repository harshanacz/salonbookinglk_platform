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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch client data
        const response = await fetch(`/api/admin/users?id=${clientId}`);
        const data = await response.json();
        setClient(data);
        
        // Fetch bookings for this client
        try {
          const bookingsResponse = await fetch(`/api/admin/bookings?clientId=${clientId}`);
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
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
  }

  // Calculate client stats
  const totalBookings = bookings.length || client.totalBookings || 0;
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.price, 0) || client.totalSpent || 0;
  const lastVisit = client.lastVisit || (bookings.length > 0 ? 
    bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : 
    "No visits yet");

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
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Last visit:{" "}
              {typeof lastVisit === 'string' ? lastVisit : new Date(lastVisit).toLocaleDateString()}
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
                LKR {totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <Clock className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
              <p className="text-sm text-muted-foreground">Last Visit</p>
              <p className="text-2xl font-bold">
                {typeof lastVisit === 'string' ? lastVisit : new Date(lastVisit).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
          <CardDescription>
            View all bookings made by this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <BookingTable bookings={bookings} />
            </TabsContent>

            <TabsContent value="upcoming">
              <BookingTable
                bookings={bookings.filter((b) => b.status === "upcoming")}
              />
            </TabsContent>

            <TabsContent value="completed">
              <BookingTable
                bookings={bookings.filter((b) => b.status === "completed")}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function BookingTable({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No bookings found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Salon</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.date}</TableCell>
            <TableCell>{booking.time}</TableCell>
            <TableCell>{booking.salon}</TableCell>
            <TableCell>{booking.service}</TableCell>
            <TableCell>LKR {booking.price.toLocaleString()}</TableCell>
            <TableCell>
              <Badge
                variant={
                  booking.status === "completed" ? "secondary" : "default"
                }
              >
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
