"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Home,
  Scissors,
  UserCheck,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Mock data - in a real application, you would fetch this from an API
const appointments = [
  {
    id: 1,
    client: "John Doe",
    salon: "Salon Elegance",
    service: "Haircut",
    staff: "Dhanuka",
    date: "2024-01-15",
    time: "10:00 AM",
    status: "Confirmed",
    email: "john.doe@example.com",
    phone: "+94 77 123 4567",
    notes: "Regular customer, prefers quick service",
    price: "Rs. 1,500",
  },
  {
    id: 2,
    client: "Jane Smith",
    salon: "Beauty Hub",
    service: "Hair Coloring",
    staff: "Samantha",
    date: "2024-01-15",
    time: "11:30 AM",
    status: "Pending",
    email: "jane.smith@example.com",
    phone: "+94 76 234 5678",
    notes: "First time customer, wants ash blonde color",
    price: "Rs. 4,500",
  },
  {
    id: 3,
    client: "Alice Johnson",
    salon: "Glamour Studio",
    service: "Manicure",
    staff: "Priyanka",
    date: "2024-01-16",
    time: "2:00 PM",
    status: "Completed",
    email: "alice.j@example.com",
    phone: "+94 71 345 6789",
    notes: "Preferred nail polish: pastel colors",
    price: "Rs. 2,000",
  },
  {
    id: 4,
    client: "Bob Brown",
    salon: "Style Masters",
    service: "Facial",
    staff: "Nimal",
    date: "2024-01-16",
    time: "3:30 PM",
    status: "Cancelled",
    email: "bob.brown@example.com",
    phone: "+94 70 456 7890",
    notes: "Sensitive skin, use gentle products",
    price: "Rs. 3,000",
  },
  {
    id: 5,
    client: "Eva Green",
    salon: "Trendy Cuts",
    service: "Pedicure",
    staff: "Kumari",
    date: "2024-01-17",
    time: "9:00 AM",
    status: "Confirmed",
    email: "eva.green@example.com",
    phone: "+94 75 567 8901",
    notes: "Regular customer, allergic to strong fragrances",
    price: "Rs. 2,500",
  },
];

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<string>("");

  // Find the appointment with the matching ID
  const appointment = appointments.find(
    (appt) => appt.id === Number(params.id)
  );

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
        <Button asChild>
          <Link href="/admin/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
          </Link>
        </Button>
      </div>
    );
  }

  // Set initial status from appointment
  useState(() => {
    setStatus(appointment.status);
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    // In a real app, you would make an API call to update the status
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Appointment Details</h1>
      </div>

      <div className=" gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Appointment #{appointment.id}</span>
              <Badge
                variant={
                  appointment.status === "Confirmed"
                    ? "default"
                    : appointment.status === "Pending"
                    ? "pending"
                    : appointment.status === "Completed"
                    ? "secondary"
                    : appointment.status === "Cancelled"
                    ? "destructive"
                    : "outline"
                }
              >
                {appointment.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              Booked for {format(new Date(appointment.date), "PPP")} at{" "}
              {appointment.time}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="font-semibold text-lg">Client Information</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>{" "}
                  {appointment.client}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>{" "}
                  {appointment.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>{" "}
                  {appointment.phone}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="font-semibold text-lg">Appointment Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Salon:</span>{" "}
                  {appointment.salon}
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Service:</span>{" "}
                  {appointment.service}
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Staff:</span>{" "}
                  {appointment.staff}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>{" "}
                  {format(new Date(appointment.date), "PPP")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span> {appointment.time}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Price:</span>{" "}
                  {appointment.price}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="font-semibold">Notes</div>
              <p className="text-sm text-muted-foreground">
                {appointment.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
