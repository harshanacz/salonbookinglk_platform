"use client";

import { useState, useEffect, Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";

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

function ComplaintViewContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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
      console.log('[VIEW_COMPLAINT] Fetching complaint with ID:', id);
      
      const response = await fetch(`/api/admin/complaints/${id}`);
      
      console.log('[VIEW_COMPLAINT] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[VIEW_COMPLAINT] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[VIEW_COMPLAINT] Received data:', data);
      
      setComplaintData(data);
    } catch (error) {
      console.error('[VIEW_COMPLAINT] Error fetching complaint:', error);
      setError("Failed to load complaint data");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load complaint data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateComplaintStatus = async (newStatus: string, statusLabel: string) => {
    if (!complaintData) return;
    
    // Prevent updates on already closed/resolved complaints
    if (complaintData.status === 'Closed' || complaintData.status === 'Resolved') {
      toast({
        title: "Cannot Update",
        description: "This complaint has already been closed or resolved.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      console.log(`[VIEW_COMPLAINT] Updating complaint ${complaintData.id} to status: ${newStatus}`);
      
      const response = await fetch(`/api/admin/complaints/${complaintData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[VIEW_COMPLAINT] Error updating status:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[VIEW_COMPLAINT] Status update result:', result);
      
      // Update local state
      setComplaintData(prev => prev ? {
        ...prev,
        status: statusLabel,
        updatedAt: new Date().toISOString()
      } : null);
      
      toast({
        title: "Success",
        description: `Complaint has been ${statusLabel.toLowerCase()}.`,
        variant: "default",
      });
    } catch (error) {
      console.error('[VIEW_COMPLAINT] Error updating complaint status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${statusLabel.toLowerCase()} complaint. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    updateComplaintStatus('closed', 'Closed');
  };

  const handleResolve = () => {
    updateComplaintStatus('resolved', 'Resolved');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
      case "PENDING":
        return "bg-red-100 text-red-800";
      case "In Progress":
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "Closed":
      case "CLOSED":
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
                <p className="text-sm text-gray-500">Email: {complaintData.defendant.email}</p>
                {complaintData.defendant.address && complaintData.defendant.address !== 'No address provided' && complaintData.defendant.address !== 'Address not available in salon context' && (
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
                  Date: {complaintData.appointment.date !== 'No date' 
                    ? new Date(complaintData.appointment.date).toLocaleDateString() 
                    : 'Not available'}
                </p>
                <p className="text-sm text-gray-500">
                  Time: {complaintData.appointment.time !== 'No time' 
                    ? complaintData.appointment.time 
                    : 'Not available'}
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

          {/* Status update notification */}
          {(complaintData.status === 'Closed' || complaintData.status === 'Resolved') && (
            <div className={`p-4 rounded-lg border-l-4 ${
              complaintData.status === 'Resolved' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : 'bg-gray-50 border-gray-400 text-gray-800'
            }`}>
              <div className="flex items-center">
                {complaintData.status === 'Resolved' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2" />
                )}
                <p className="font-medium">
                  This complaint has been {complaintData.status.toLowerCase()}.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-4 justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleDismiss}
            disabled={isUpdating || complaintData.status === 'Closed' || complaintData.status === 'Resolved'}
          >
            <XCircle className="h-4 w-4" />
            {isUpdating ? 'Updating...' : 'Dismiss'}
          </Button>
          <Button 
            variant="default" 
            className="flex items-center gap-2"
            onClick={handleResolve}
            disabled={isUpdating || complaintData.status === 'Closed' || complaintData.status === 'Resolved'}
          >
            <CheckCircle className="h-4 w-4" />
            {isUpdating ? 'Updating...' : 'Resolve'}
          </Button>
          <Link href="/admin/notifications">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notify
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ViewComplaint() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    }>
      <ComplaintViewContent />
    </Suspense>
  );
}
