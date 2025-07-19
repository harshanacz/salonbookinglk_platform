"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, XCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface ComplaintData {
  id: string;
  complainant: {
    name: string;
    contact: string;
    email: string;
  };
  defendant: {
    name: string;
    contact: string;
    email: string;
    address: string;
  };
  service: string;
  appointment: {
    date: string;
    time: string;
  };
  payment: string;
  paymentMethod: string;
  staffInvolved: string;
  status: string;
  category: string;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewComplaint() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const complaintId = searchParams.get("id");

  useEffect(() => {
    if (complaintId) {
      fetchComplaintData(complaintId);
    } else {
      setError("No complaint ID provided");
      setIsLoading(false);
    }
  }, [complaintId]);

  const fetchComplaintData = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/complaints/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaint data');
      }
      
      const data = await response.json();
      setComplaintData(data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      setError("Failed to load complaint data");
      toast({
        title: "Error",
        description: "Failed to load complaint data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCategory = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading complaint details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !complaintData) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <p className="text-red-600 mb-4">{error || "Complaint not found"}</p>
              <Link href="/admin/complaints">
                <Button variant="outline">Back to Complaints</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/admin/complaints">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Complaints
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Complaint Details</CardTitle>
              <CardDescription>Complaint ID: {complaintData.id}</CardDescription>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(complaintData.status)}`}>
              {complaintData.status}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category and Subject */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Category</h3>
              <p className="text-sm font-medium text-gray-800">{formatCategory(complaintData.category)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Subject</h3>
              <p className="text-sm font-medium text-gray-800">{complaintData.subject}</p>
            </div>
          </div>

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
                <p className="text-sm text-gray-500">{complaintData.defendant.email}</p>
                {complaintData.defendant.address && (
                  <p className="text-sm text-gray-500">{complaintData.defendant.address}</p>
                )}
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
                  Date: {new Date(complaintData.appointment.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Time: {complaintData.appointment.time}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Payment & Staff Details</h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">
                  Staff Involved: {complaintData.staffInvolved}
                </p>
                <p className="text-sm text-gray-500">
                  Payment Amount: {complaintData.payment}
                </p>
                <p className="text-sm text-gray-500">
                  Payment Method: {complaintData.paymentMethod}
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

          {/* Timestamps */}
          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900 text-sm">Created At:</h4>
              <p className="text-sm text-gray-500">
                {new Date(complaintData.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900 text-sm">Last Updated:</h4>
              <p className="text-sm text-gray-500">
                {new Date(complaintData.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-4 justify-end">
          <Button variant="outline" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Dismiss
          </Button>
          <Button variant="default" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolve
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
