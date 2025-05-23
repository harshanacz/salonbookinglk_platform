"use client";

import { useState, useEffect } from "react";
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
  Scissors,
  UserCheck,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// Define appointment type
interface Appointment {
  _id: string;
  clientId: {
    _id: string;
    userName: string;
    email: string;
    mobileNumber: string;
  };  serviceId: {
    _id: string;
    type: string;
    price: number;
    duration: number;
  };staffId: {
    _id: string;
    name: string;
  };
  date: string;
  time: string;
  status: string;
  note?: string;
}

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/admin/appointments/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching appointment: ${response.status}`);
        }
        
        const data = await response.json();
        setAppointment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointment');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchAppointment();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading appointment details...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h1 className="text-2xl font-bold mb-4">
          {error || "Appointment Not Found"}
        </h1>
        <Button asChild>
          <Link href="/admin/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Appointments
          </Link>
        </Button>
      </div>
    );
  }

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

      <div className="gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Appointment #{appointment._id.substring(0, 8)}</span>
              <Badge
                variant={
                  appointment.status === "CONFIRMED"
                    ? "default"
                    : appointment.status === "PENDING"
                    ? "pending"
                    : appointment.status === "COMPLETED"
                    ? "secondary"
                    : appointment.status === "CANCELLED"
                    ? "destructive"
                    : "outline"
                }
              >
                {appointment.status}
              </Badge>
            </CardTitle>              <CardDescription>
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
                  {appointment.clientId.userName}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>{" "}
                  {appointment.clientId.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Mobile:</span>{" "}
                  {appointment.clientId.mobileNumber}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="font-semibold text-lg">Appointment Details</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Service:</span>{" "}
                  {appointment.serviceId.type}
                </div><div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Staff:</span>{" "}
                  {appointment.staffId.name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>{" "}
                  {format(new Date(appointment.date), "PPP")}
                </div>                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Time:</span>{" "}
                  {appointment.time}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Price:</span>{" "}
                  Rs. {appointment.serviceId.price.toLocaleString()}
                </div>
              </div>
            </div>

            {appointment.note && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="font-semibold">Notes</div>
                  <p className="text-sm text-muted-foreground">
                    {appointment.note}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}