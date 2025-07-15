"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Scissors,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  Power,
  PowerOff,
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
  isActive?: boolean;
};

type Service = {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  type?: string;
  status?: string;
  images?: string[];
  bookings?: number;
  views?: number;
  averageRating?: number;
  reviewCount?: number;
};

const SalonDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const salonId = params.id as string;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Search and pagination states for services
  const [servicesSearchTerm, setServicesSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [servicesCurrentPage, setServicesCurrentPage] = useState(1);
  const [servicesPagination, setServicesPagination] = useState({
    total: 0,
    pages: 0,
    limit: 10,
  });
  const [servicesLoading, setServicesLoading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(servicesSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [servicesSearchTerm]);

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        setLoading(true);

        // Fetch salon details
        const salonResponse = await fetch(`/api/admin/salons/${salonId}`);

        if (!salonResponse.ok) {
          if (salonResponse.status === 404) {
            throw new Error("Salon not found");
          }
          throw new Error("Failed to fetch salon details");
        }

        const salonData = await salonResponse.json();

        // Map the API data to the Salon type
        const formattedSalon: Salon = {
          id: salonData._id,
          name: salonData.userName || "Unnamed Salon",
          image: salonData.profileImage || "https://placehold.co/400x400",
          email: salonData.email || "",
          contactNumber: salonData.mobileNumber || "",
          location: salonData.country || "",
          status: salonData.status || "Pending",
          startedDate:
            salonData.createdAt &&
            new Date(salonData.createdAt).toString() !== "Invalid Date"
              ? new Date(salonData.createdAt).toISOString().split("T")[0]
              : "",
          updatedDate:
            salonData.updatedAt &&
            new Date(salonData.updatedAt).toString() !== "Invalid Date"
              ? new Date(salonData.updatedAt).toISOString().split("T")[0]
              : "",
          description: salonData.description || "",
          isActive: salonData.isActive !== undefined ? salonData.isActive : true,
        };

        setSalon(formattedSalon);
      } catch (error) {
        console.error("Error fetching salon details:", error);
        setError(
          `Failed to load salon details: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [salonId]);

  // Separate function to fetch services with pagination
  const fetchServices = async (page: number = 1, search: string = "") => {
    try {
      setServicesLoading(true);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: servicesPagination.limit.toString(),
        ...(search && { search }),
      });

      const servicesResponse = await fetch(
        `/api/admin/salons/${salonId}/services?${queryParams}`
      );

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.services || []);
        setServicesPagination({
          total: servicesData.pagination.total,
          pages: servicesData.pagination.pages,
          limit: servicesData.pagination.limit,
        });
      } else {
        console.warn("Failed to fetch services, using empty array");
        setServices([]);
        setServicesPagination({
          total: 0,
          pages: 0,
          limit: 10,
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(servicesSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [servicesSearchTerm]);

  // Fetch services when salon ID, current page, or debounced search term changes
  useEffect(() => {
    if (salonId) {
      fetchServices(servicesCurrentPage, debouncedSearchTerm);
    }
  }, [salonId, servicesCurrentPage, debouncedSearchTerm]);

  // Reset pagination when search terms change
  useEffect(() => {
    setServicesCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Pagination handlers
  const handleServicesPageChange = (page: number) => {
    setServicesCurrentPage(page);
  };

  // Toggle salon active status
  const handleToggleSalonStatus = async () => {
    if (!salon) return;
    
    setToggleLoading(true);
    try {
      const response = await fetch(`/api/admin/salons/${salonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toggleStatus: !salon.isActive,
        }),
      });

      if (response.ok) {
        const updatedSalon = await response.json();
        setSalon(prev => prev ? { ...prev, isActive: updatedSalon.isActive } : null);
        // Refresh services to show updated statuses
        fetchServices(servicesCurrentPage, debouncedSearchTerm);
        
        toast({
          title: "Success",
          description: `Salon ${updatedSalon.isActive ? 'activated' : 'deactivated'} successfully.`,
        });
      } else {
        throw new Error("Failed to update salon status");
      }
    } catch (error) {
      console.error("Error toggling salon status:", error);
      toast({
        title: "Error",
        description: "Failed to update salon status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setToggleLoading(false);
    }
  };

  // Toggle individual service status
  const handleToggleServiceStatus = async (serviceId: string, currentStatus: string) => {
    // Check if salon is active before allowing service status change
    if (!salon?.isActive) {
      toast({
        title: "Action Not Allowed",
        description: "Cannot change service status when salon is deactivated.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      
      const response = await fetch(`/api/admin/salons/${salonId}/services`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: serviceId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Refresh services to show updated status
        fetchServices(servicesCurrentPage, debouncedSearchTerm);
        
        toast({
          title: "Success",
          description: `Service ${newStatus.toLowerCase()} successfully.`,
        });
      } else {
        throw new Error("Failed to update service status");
      }
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast({
        title: "Error",
        description: "Failed to update service status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-12">Loading salon details...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button variant="outline" onClick={() => router.push("/admin/salons")}>
          Back to Salons
        </Button>
      </div>
    );
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
        {salon && (
          <Button
            variant={salon.isActive ? "cancel" : "success"}
            onClick={handleToggleSalonStatus}
            disabled={toggleLoading}
            className="flex items-center gap-2"
          >
            {salon.isActive ? (
              <>
                <PowerOff className="h-4 w-4" />
                {toggleLoading ? "Deactivating..." : "Deactivate Salon"}
              </>
            ) : (
              <>
                <Power className="h-4 w-4" />
                {toggleLoading ? "Activating..." : "Activate Salon"}
              </>
            )}
          </Button>
        )}
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
                <div className="flex gap-2">
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
                  <Badge
                    variant={salon.isActive ? "default" : "destructive"}
                  >
                    {salon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
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
          <div className="mt-8 flex items-center gap-2">
            <Scissors className="h-4 w-4" />
            <div className="font-semibold text-lg">Services</div>
          </div>

          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    className="pl-8"
                    value={servicesSearchTerm}
                    onChange={(e) => setServicesSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicesLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading services...
                      </TableCell>
                    </TableRow>
                  ) : services.length > 0 ? (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{service.name}</span>
                            {service.description && (
                              <span className="text-sm text-muted-foreground line-clamp-2">
                                {service.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {service.type?.replace("_", " ") || "N/A"}
                          </Badge>
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
                        <TableCell>
                          <Badge
                            variant={
                              service.status === "ACTIVE"
                                ? "default"
                                : service.status === "PENDING"
                                ? "pending"
                                : service.status === "REJECTED"
                                ? "destructive"
                                : service.status === "INACTIVE"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {service.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{service.bookings || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>
                              {service.averageRating?.toFixed(1) || "0.0"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({service.reviewCount || 0})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(service.status === "ACTIVE" || service.status === "INACTIVE") && (
                            <Button
                              variant={service.status === "ACTIVE" ? "cancel" : "default"}
                              size="sm"
                              onClick={() => handleToggleServiceStatus(service.id, service.status || "")}
                              disabled={!salon.isActive}
                              className="flex items-center gap-1"
                            >
                              {service.status === "ACTIVE" ? (
                                <>
                                  <PowerOff className="h-3 w-3" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="h-3 w-3" />
                                  Activate
                                </>
                              )}
                            </Button>
                          )}
                          {!salon.isActive && (service.status === "ACTIVE" || service.status === "INACTIVE") && (
                            <span className="text-xs text-muted-foreground">
                              Salon is deactivated
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No services found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {servicesPagination.pages > 1 && (
              <CardFooter className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  {(servicesCurrentPage - 1) * servicesPagination.limit + 1}-
                  {Math.min(
                    servicesCurrentPage * servicesPagination.limit,
                    servicesPagination.total
                  )}{" "}
                  of {servicesPagination.total} services
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleServicesPageChange(servicesCurrentPage - 1)
                    }
                    disabled={servicesCurrentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                  </Button>
                  <div className="text-sm font-medium">
                    Page {servicesCurrentPage} of {servicesPagination.pages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleServicesPageChange(servicesCurrentPage + 1)
                    }
                    disabled={servicesCurrentPage >= servicesPagination.pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalonDetailPage;
