"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, XCircle, CheckCircle } from "lucide-react";

export default function ViewComplaint() {
  // Mock data - replace with actual data fetching
  const complaintData = {
    id: "A00001",
    complainant: {
      name: "John Doe",
      contact: "+94 71 234 5678",
      email: "john.doe@email.com",
    },
    defendant: {
      name: "Style & Smile Salon",
      contact: "+94 11 234 5678",
    },
    service: "Hair Coloring",
    appointment: {
      date: "2024-01-15",
      time: "14:30",
    },
    payment: "LKR 4,500",
    staffInvolved: "Sarah Smith",
    status: "Pending",
    description:
      "The hair color result was completely different from what was promised. The stylist did not follow the reference picture I provided. I experienced scalp irritation after the service, and when I complained to the salon, they were not helpful in resolving the issue.",
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Complaint Details</CardTitle>
              <CardDescription>Complaint ID: {complaintData.id}</CardDescription>
            </div>
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              {complaintData.status}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Complainant Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Complainant Details</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">{complaintData.complainant.name}</p>
                <p className="text-sm text-gray-500">{complaintData.complainant.contact}</p>
                <p className="text-sm text-gray-500">{complaintData.complainant.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Salon Details</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">{complaintData.defendant.name}</p>
                <p className="text-sm text-gray-500">{complaintData.defendant.contact}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Service Information</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">Service: {complaintData.service}</p>
                <p className="text-sm text-gray-500">
                  Date: {complaintData.appointment.date}
                </p>
                <p className="text-sm text-gray-500">
                  Time: {complaintData.appointment.time}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Additional Details</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">
                  Staff Involved: {complaintData.staffInvolved}
                </p>
                <p className="text-sm text-gray-500">
                  Payment Amount: {complaintData.payment}
                </p>
              </div>
            </div>
          </div>

          {/* Complaint Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Complaint Description</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {complaintData.description}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-4 justify-end">
          <Button variant="outline" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Dismiss
          </Button>
          <Button variant="default" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            OK
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notify
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
