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
import { Check, X, Home, ChevronRight, Loader2, Phone, Mail, MapPin, Clock, Calendar, User, Building, Globe, Briefcase, Star } from "lucide-react";
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
  isActive?: boolean;
}

interface WorkingHour {
  day: string;
  isOpen: boolean;
  open: string;
  close: string;
}

interface SalonContext {
  _id: string;
  userId: string;
  businessName: string;
  website?: string;
  businessRegistrationNumber?: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  phoneNumber: string;
  ownerName: string;
  profilePictureUrl: string;
  numberOfReviewers?: number;
  reviewScore?: number;
  businessHours: WorkingHour[];
}

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  profileImage: string;
  bio: string;
  availability: string;
  workingDays: string[];
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
  staffAssigned: string[];
  staffDetails?: StaffMember[];
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
        console.log("Service data received:", data);
        console.log("User status (isActive):", data.userId?.isActive);
        console.log("Salon context:", data.salonContext);
        console.log("Review score:", data.salonContext?.reviewScore);
        console.log("Number of reviewers:", data.salonContext?.numberOfReviewers);
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
      const response = await fetch(`/api/admin/service-cards/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve'
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
      const response = await fetch(`/api/admin/service-cards/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject'
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

      <Tabs defaultValue="service-details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="service-details">Service Details</TabsTrigger>
          <TabsTrigger value="salon-info">Salon Owner Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="service-details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
             
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

              <div className="space-y-6">
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
                    <div className="flex justify-between">
                      <dt className="font-medium">Last Updated:</dt>
                      <dd>{new Date(service.updatedAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <Separator className="my-2" />
                  <p className="text-muted-foreground whitespace-pre-line">
                    {service.description || "No description provided."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Assigned Staff</h3>
                  <Separator className="my-2" />
                  {service.staffAssigned && service.staffAssigned.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.staffAssigned.map((staffId, index) => {
                        if (staffId === 'any') {
                          return (
                            <div key={index} className="col-span-full">
                              <h4 className="text-md font-medium mb-2">All Staff Members</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.staffDetails?.map((staffMember, staffIndex) => (
                                  <div key={staffIndex} className="flex items-center gap-4 p-4 bg-muted rounded-md">
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                      <Image
                                        src={staffMember.profileImage || "/placeholder-user.jpg"}
                                        alt={staffMember.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium">{staffMember.name}</p>
                                      <p className="text-sm text-muted-foreground">{staffMember.role}</p>
                                      <p className="text-sm text-muted-foreground">{staffMember.availability}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        
                        const staffMember = service.staffDetails?.find(s => s._id === staffId);
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-md">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                              <Image
                                src={staffMember?.profileImage || "/placeholder-user.jpg"}
                                alt={staffMember?.name || "Staff Member"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{staffMember?.name || staffId}</p>
                              {staffMember && (
                                <>
                                  <p className="text-sm text-muted-foreground">{staffMember.role}</p>
                                  <p className="text-sm text-muted-foreground">{staffMember.availability}</p>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No staff members assigned</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {/* Add debugging info to see actual value */}
              <div className="mr-auto">
                {service.userId?.isActive === false ? (
                  <>
                    <Badge variant="destructive">User Account Inactive</Badge>
                    <p className="text-sm text-muted-foreground mt-1">Service actions are disabled for inactive users.</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">User status: {service.userId?.isActive === undefined ? "Unknown" : service.userId?.isActive ? "Active" : "Inactive"}</p>
                )}
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-red-50"
                    disabled={service.userId?.isActive === false}
                    title={service.userId?.isActive === false ? "Cannot reject services from inactive users" : ""}
                  >
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

              <Button 
                onClick={handleApprove} 
                disabled={approving || service.userId?.isActive === false}
                title={service.userId?.isActive === false ? "Cannot approve services from inactive users" : ""}
              >
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
                        src={service.salonContext?.profilePictureUrl || service.userId?.profileImage || "/placeholder-user.jpg"}
                        alt={service.userId?.userName || "Salon Owner"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">
                      {service.salonContext?.ownerName || service.userId?.userName || "Owner Name Not Provided"}
                    </h4>
                    
                    <div className="flex items-center gap-2 my-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.userId?.email || "No email provided"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 my-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.salonContext?.phoneNumber || service.userId?.mobileNumber || "No phone provided"}</span>
                    </div>
                    
                    {/* <div className="flex items-center gap-2 my-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {service.userId?.gender || "Gender not specified"}
                      </span>
                    </div> */}
                    
                    {/* <div className="flex items-center gap-2 my-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{service.userId?.country || "Country not specified"}</span>
                    </div>
                     */}
                    {(service.salonContext?.reviewScore !== undefined || service.salonContext?.numberOfReviewers !== undefined) && (
                      <div className="mt-4 bg-primary/10 px-4 py-2 rounded-full">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const averageRating = service.salonContext?.numberOfReviewers && service.salonContext.numberOfReviewers > 0 
                                ? (service.salonContext?.reviewScore || 0) / service.salonContext.numberOfReviewers 
                                : 0;
                              return (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= Math.round(averageRating)
                                      ? "fill-yellow-400 stroke-yellow-400"
                                      : "fill-gray-200 stroke-gray-200"
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="font-semibold">
                            {service.salonContext?.numberOfReviewers && service.salonContext.numberOfReviewers > 0 
                              ? ((service.salonContext?.reviewScore || 0) / service.salonContext.numberOfReviewers).toFixed(1)
                              : "0.0"
                            }/5
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({service.salonContext?.numberOfReviewers || 0} reviews)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
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
                          <dt className="font-medium">Website:</dt>
                          <dd className="col-span-2">
                            {service.salonContext.website ? (
                              <a 
                                href={service.salonContext.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {service.salonContext.website}
                              </a>
                            ) : (
                              "Not provided"
                            )}
                          </dd>
                        </div>

                        <div className="grid grid-cols-3 py-1">
                          <dt className="font-medium">Description:</dt>
                          <dd className="col-span-2">{service.salonContext.description}</dd>
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
                      <div className="space-y-4">
                        {/* <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="font-medium">{service.salonContext.businessName}</p>
                          <p>{service.salonContext.description}</p>
                          <p>{service.userId?.country}</p>
                        </div> */}

                        {service.salonContext.location && (
                          <div className="h-[300px] rounded-lg overflow-hidden">
                            <iframe
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${service.salonContext.location.lat},${service.salonContext.location.lng}`}
                              allowFullScreen
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-2">No address information available</p>
                    )}
                  </div>

                  {service.salonContext?.businessHours && service.salonContext.businessHours.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Working Hours
                      </h3>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.salonContext.businessHours.map((hour, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <span className="font-medium">{hour.day}</span>
                            <span>
                              {hour.isOpen ? (
                                `${formatTime(hour.open)} - ${formatTime(hour.close)}`
                              ) : (
                                "Closed"
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            {/* <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/admin/salons/${service.userId?._id}`}>
                  <Briefcase className="mr-2 h-4 w-4" /> View Complete Salon Profile
                </Link>
              </Button>
            </CardFooter> */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) return time;
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
