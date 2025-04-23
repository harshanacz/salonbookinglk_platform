"use client";

import { useState, useEffect, use } from "react";
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

// Mock client data (in a real app, this would come from an API)
const clients = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+94 77 123 4567",
    totalBookings: 15,
    totalSpent: 15000,
    lastVisit: "2024-01-10",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+94 77 234 5678",
    totalBookings: 22,
    totalSpent: 22000,
    lastVisit: "2024-01-05",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  // Additional clients from the original file would be here
];

// Mock bookings data
const mockBookings = {
  1: [
    {
      id: 101,
      date: "2024-01-10",
      time: "10:00 AM",
      salon: "Elite Hair Salon",
      service: "Haircut & Styling",
      price: 2500,
      status: "completed",
    },
    {
      id: 102,
      date: "2023-12-15",
      time: "2:30 PM",
      salon: "Elite Hair Salon",
      service: "Hair Coloring",
      price: 3500,
      status: "completed",
    },
    {
      id: 103,
      date: "2024-01-25",
      time: "11:00 AM",
      salon: "Glow Beauty Spa",
      service: "Facial Treatment",
      price: 4000,
      status: "upcoming",
    },
  ],
  2: [
    {
      id: 201,
      date: "2024-01-05",
      time: "1:00 PM",
      salon: "Serenity Spa",
      service: "Full Body Massage",
      price: 5000,
      status: "completed",
    },
    {
      id: 202,
      date: "2023-12-20",
      time: "3:00 PM",
      salon: "Elite Hair Salon",
      service: "Manicure & Pedicure",
      price: 3000,
      status: "completed",
    },
  ],
};

export default function ClientDetailsPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = use(props.params);
  const clientId = parseInt(params.id);
  const [client, setClient] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch data from an API
    const foundClient = clients.find((c) => c.id === clientId);
    const clientBookings =
      mockBookings[clientId as keyof typeof mockBookings] || [];

    setClient(foundClient);
    setBookings(clientBookings);
    setLoading(false);
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

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
            <AvatarImage src={client.avatar} />
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
              {new Date(client.lastVisit).toLocaleDateString()}
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
              <p className="text-2xl font-bold">{client.totalBookings}</p>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <DollarSign className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">
                LKR {client.totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <Clock className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
              <p className="text-sm text-muted-foreground">Last Visit</p>
              <p className="text-2xl font-bold">
                {new Date(client.lastVisit).toLocaleDateString()}
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

function BookingTable({ bookings }: { bookings: any[] }) {
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
