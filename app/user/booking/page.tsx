"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, XCircle } from "lucide-react";
import { UserAppointments } from "@/components/user/booking/user-appointments";
import { CancelAppointments } from "@/components/user/booking/cancel-appointments";

export default function BookingPage() {
  return (
    <div className="container w-full mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your salon appointments
        </p>
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">My Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="cancellations" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Cancelled Appointments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>
                View and manage your upcoming salon appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserAppointments />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancellations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Appointments</CardTitle>
              <CardDescription>
                View your cancelled appointments history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CancelAppointments />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 