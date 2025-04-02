"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Scissors,
  DollarSign,
  User,
} from "lucide-react";

type Salon = {
  id: string;
  name: string;
  image: string;
  email: string;
  contactNumber: string;
  location: string;
  status: string;
  startedDate: string;
  updatedDate: string;
  description?: string;
};

type Service = {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
};

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  service: string;
  status: string;
};

// Sample data
const sampleSalon: Salon = {
  id: "1",
  name: "Elegance Hair Studio",
  image: "https://placehold.co/400x400",
  email: "contact@elegancehair.com",
  contactNumber: "+1 (123) 456-7890",
  location: "123 Beauty Street, Fashion District",
  status: "Pending",
  startedDate: "2023-01-15",
  updatedDate: "2023-06-22",
  description:
    "Elegance Hair Studio offers premium hair styling, coloring, and treatment services in a luxurious environment. Our team of expert stylists is dedicated to helping you look and feel your best.",
};

const sampleServices: Service[] = [
  {
    id: "s1",
    name: "Haircut & Styling",
    price: 45,
    duration: "45 minutes",
    description:
      "Professional haircut and styling tailored to your preferences and face shape.",
  },
  {
    id: "s2",
    name: "Hair Coloring",
    price: 85,
    duration: "2 hours",
    description:
      "Full hair coloring with premium products for vibrant, long-lasting results.",
  },
  {
    id: "s3",
    name: "Hair Treatment",
    price: 65,
    duration: "1 hour",
    description:
      "Nourishing hair treatment to repair damaged hair and add shine.",
  },
  {
    id: "s4",
    name: "Bridal Package",
    price: 150,
    duration: "3 hours",
    description:
      "Complete bridal styling including hair, makeup, and accessories.",
  },
];

const sampleBookings: Booking[] = [
  {
    id: "b1",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    date: "2023-08-10",
    time: "10:30 AM",
    service: "Haircut & Styling",
    status: "Completed",
  },
  {
    id: "b2",
    customerName: "John Davis",
    customerEmail: "john.davis@example.com",
    date: "2023-08-15",
    time: "2:00 PM",
    service: "Hair Coloring",
    status: "Upcoming",
  },
  {
    id: "b3",
    customerName: "Emily Johnson",
    customerEmail: "emily.j@example.com",
    date: "2023-08-12",
    time: "11:15 AM",
    service: "Hair Treatment",
    status: "Cancelled",
  },
  {
    id: "b4",
    customerName: "Michael Brown",
    customerEmail: "michael.b@example.com",
    date: "2023-08-18",
    time: "4:30 PM",
    service: "Haircut & Styling",
    status: "Pending",
  },
];

const SalonDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSampleData = setTimeout(() => {
      setSalon(sampleSalon);
      setServices(sampleServices);
      setBookings(sampleBookings);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(loadSampleData);
  }, []);

  if (loading) {
    return <div className="text-center p-12">Loading...</div>;
  }

  if (!salon) {
    return <div className="text-center p-12">Salon not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/admin/salons">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Salon Details</h1>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/10">
              <Image
                src={salon.image}
                alt={`${salon.name} logo`}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">{salon.name}</CardTitle>
              <CardDescription>
                <Badge
                  variant={
                    salon.status === "Approved"
                      ? "default"
                      : salon.status === "Pending"
                      ? "pending"
                      : salon.status === "Rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {salon.status === "Approved" ? "Verified" : salon.status}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="font-semibold text-lg">Salon Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span> {salon.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Contact:</span>{" "}
                {salon.contactNumber}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span> {salon.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Started:</span>{" "}
                {salon.startedDate}
              </div>
            </div>
          </div>

          {salon.description && (
            <div className="space-y-2 mt-6">
              <div className="font-semibold">Description</div>
              <p className="text-sm text-muted-foreground">
                {salon.description}
              </p>
            </div>
          )}

          <Tabs defaultValue="services" className="mt-6">
            <TabsList className="mb-6">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bookings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length > 0 ? (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {service.price}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {service.duration}
                          </span>
                        </TableCell>
                        <TableCell>{service.description}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No services found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="bookings">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <p className="font-medium">
                                {booking.customerName}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {booking.customerEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Scissors className="h-3 w-3 text-muted-foreground" />
                            {booking.service}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {booking.date} at {booking.time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "Completed"
                                ? "default"
                                : booking.status === "Upcoming"
                                ? "secondary"
                                : booking.status === "Pending"
                                ? "pending"
                                : booking.status === "Cancelled"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalonDetailPage;
