"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, X, Home, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";

interface ServiceDetails {
  _id: string;
  title: string;
  type: string;
  description: string;
  images: string[];
  price: number;
  duration: number;
  userId: {
    _id: string;
    userName: string;
    businessName: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServiceDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        // Fetch the specific service by ID
        const response = await fetch(`/api/admin/service-cards/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setService(data);
      } catch (err) {
        console.error("Failed to fetch service details:", err);
        toast({
          title: "Error",
          description: "Failed to load service details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetails();
    }
  }, [id, toast]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      const response = await fetch('/api/admin/service-cards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: id,
          approved: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Success",
        description: "Service has been approved successfully",
      });
      
      // Redirect back to the service list
      router.push('/admin/service-cards');
      router.refresh();
    } catch (err) {
      console.error("Failed to approve service:", err);
      toast({
        title: "Error",
        description: "Failed to approve service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setRejecting(true);
      const response = await fetch('/api/admin/service-cards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: id,
          approved: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Service Rejected",
        description: "Service has been rejected",
      });
      
      // Redirect back to the service list
      router.push('/admin/service-cards');
      router.refresh();
    } catch (err) {
      console.error("Failed to reject service:", err);
      toast({
        title: "Error",
        description: "Failed to reject service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Service not found</p>
        <Button onClick={() => router.push('/admin/service-cards')} className="mt-4">
          Back to Service List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/service-cards">
              Service Cards
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>{service.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{service.title}</h1>
        <Badge>{service.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Submitted by {service.userId?.businessName || "Unknown Salon"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Images */}
          {service.images && service.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {service.images.map((image, index) => (
                <div key={index} className="relative aspect-video overflow-hidden rounded-md">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${service.title} - image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No images available</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium">Basic Information</h3>
              <Separator className="my-2" />
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium">Service Type:</dt>
                  <dd>{service.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Price:</dt>
                  <dd>LKR {service.price?.toFixed(2) || "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Duration:</dt>
                  <dd>{service.duration} minutes</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Date Submitted:</dt>
                  <dd>{new Date(service.createdAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium">Salon Information</h3>
              <Separator className="my-2" />
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="font-medium">Business Name:</dt>
                  <dd>{service.userId?.businessName || "Unknown"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Contact Person:</dt>
                  <dd>{service.userId?.userName || "Unknown"}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <Separator className="my-2" />
            <p className="text-muted-foreground whitespace-pre-line">
              {service.description || "No description provided."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="bg-red-50">
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to reject this service?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will mark the service as rejected and notify the salon owner.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReject} className="bg-red-600 hover:bg-red-700">
                  {rejecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Reject Service
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleApprove} disabled={approving}>
            {approving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Approve Service
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
