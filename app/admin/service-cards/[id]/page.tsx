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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, X, Home, ChevronRight, Loader2, Phone, Mail, MapPin, Clock, Calendar, User, Building, Globe, Briefcase } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SalonUser {
  _id: string;
  userName: string;
  businessName: string;
  email: string;
  mobileNumber: string;
  profileImage: string;
  clerkUserId: string;
  type: string;
  gender: string;
  country: string;
}

interface WorkingHour {
  day: string;
  isWorking: boolean;
  start: number;
  end: number;
}

interface SalonContext {
  _id: string;
  userId: string;
  businessName: string;
  website?: string;
  businessRegistrationNumber?: string;
  businessCategory: string;
  streetAddress: string;
  city: string;
  postalCode?: string;
  workingHours: WorkingHour[];
  numberOfReviewers?: number;
  reviewScore?: number;
}

interface ServiceDetails {
  _id: string;
  title: string;
  type: string;
  description: string;
  images: string[];
  price: number;
  duration: number;
  userId: SalonUser;
  salonContext: SalonContext | null;
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

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDay = (day: string) => {
    const days: Record<string, string> = {
      MON: 'Monday',
      TUE: 'Tuesday',
      WED: 'Wednesday',
      THU: 'Thursday',
      FRI: 'Friday',
      SAT: 'Saturday',
      SUN: 'Sunday',
    };
    return days[day] || day;
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

      <Tabs defaultValue="service-details">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="service-details">Service Details</TabsTrigger>
          <TabsTrigger value="salon-info">Salon Owner Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="service-details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Submitted by {service.userId?.businessName || "Unknown Salon"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <div className="flex justify-between">
                      <dt className="font-medium">Location:</dt>
                      <dd>{service.salonContext?.city || "Unknown"}</dd>
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
        </TabsContent>
        
        <TabsContent value="salon-info" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Salon Owner Information</CardTitle>
              <CardDescription>
                Detailed information about the salon owner
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="flex flex-col items-center text-center p-6 bg-muted rounded-lg">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4">
                      <Image
                        src={service.userId?.profileImage || "/placeholder-user.jpg"}
                        alt={service.userId?.userName || "Salon Owner"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold">{service.userId?.userName || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{service.userId?.businessName}</p>
                    <Badge className="mb-4">{service.userId?.type}</Badge>
                    
                    <div className="flex items-center gap-2 my-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.userId?.email || "No email provided"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 my-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.userId?.mobileNumber || "No phone provided"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 my-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {service.userId?.gender || "Gender not specified"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 my-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.userId?.country || "Country not specified"}</span>
                    </div>
                    
                    {service.salonContext?.reviewScore !== undefined && (
                      <div className="mt-4 bg-primary/10 px-4 py-2 rounded-full">
                        <span className="font-semibold">
                          Rating: {(service.salonContext.reviewScore !== undefined && service.salonContext.numberOfReviewers ? (service.salonContext.reviewScore / service.salonContext.numberOfReviewers).toFixed(1) : "0.0" )}/5
                        </span>
                        <span className="text-xs ml-2">
                          ({service.salonContext.numberOfReviewers} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Building className="h-5 w-5" /> Business Information
                    </h3>
                    <Separator className="my-2" />
                    
                    {service.salonContext ? (
                      <dl className="space-y-2">
                        <div className="grid grid-cols-3 py-1">
                          <dt className="font-medium">Business Name:</dt>
                          <dd className="col-span-2">{service.salonContext.businessName}</dd>
                        </div>
                        
                        <div className="grid grid-cols-3 py-1">
                          <dt className="font-medium">Registration Number:</dt>
                          <dd className="col-span-2">{service.salonContext.businessRegistrationNumber || "Not provided"}</dd>
                        </div>
                        
                        <div className="grid grid-cols-3 py-1">
                          <dt className="font-medium">Business Category:</dt>
                          <dd className="col-span-2">{service.salonContext.businessCategory}</dd>
                        </div>
                        
                        <div className="grid grid-cols-3 py-1">
                          <dt className="font-medium">Website:</dt>
                          <dd className="col-span-2">
                            {service.salonContext.website ? (
                              <a 
                                href={service.salonContext.website.startsWith('http') ? service.salonContext.website : `https://${service.salonContext.website}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {service.salonContext.website}
                              </a>
                            ) : (
                              "Not provided"
                            )}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-muted-foreground py-2">No business information available</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <MapPin className="h-5 w-5" /> Address Information
                    </h3>
                    <Separator className="my-2" />
                    
                    {service.salonContext ? (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="font-medium">{service.salonContext.businessName}</p>
                        <p>{service.salonContext.streetAddress}</p>
                        <p>{service.salonContext.city}{service.salonContext.postalCode ? `, ${service.salonContext.postalCode}` : ''}</p>
                        <p>{service.userId?.country}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-2">No address information available</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-5 w-5" /> Working Hours
                    </h3>
                    <Separator className="my-2" />
                    
                    {service.salonContext?.workingHours && service.salonContext.workingHours.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.salonContext.workingHours
                          .sort((a, b) => {
                            const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
                            return days.indexOf(a.day) - days.indexOf(b.day);
                          })
                          .map((workingHour, index) => (
                            <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/30">
                              <span className="font-medium">{formatDay(workingHour.day)}:</span>
                              {workingHour.isWorking ? (
                                <span>
                                  {formatTime(workingHour.start)} - {formatTime(workingHour.end)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Closed</span>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-2">No working hours available</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/admin/salons/${service.userId?._id}`}>
                  <Briefcase className="mr-2 h-4 w-4" /> View Complete Salon Profile
                </Link>
              </Button>
              
              <div className="space-x-2">
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
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
