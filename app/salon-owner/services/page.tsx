"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  title: string;
  image: string;
  price: number;
  status: string;
  impressions: number;
  clicks: number;
  appointments: number;
  staffAssigned: number;
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch("/api/salon-owner/services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const data: Service[] = await res.json();
        setServices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch("/api/salon-owner/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete service");
      setServices((prev) => prev.filter((svc) => svc.id !== id));
      toast({ title: "Service deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredServices = services
    .filter(
      (svc) =>
        (activeTab === "active" && svc.status === "active") ||
        (activeTab === "pending" && svc.status === "pending") ||
        (activeTab === "inactive" && (svc.status === "inactive" || svc.status === "rejected"))
    )
    .filter((svc) =>
      svc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading) {
    return <div>Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Your Services</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/salon-owner/services/create">
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Services</CardTitle>
          <CardDescription>
            View and manage all your salon services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="active">
                Active ({services.filter((s) => s.status === "active").length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Approval (
                {services.filter((s) => s.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive/Rejected (
                {services.filter((s) => s.status === "inactive" || s.status === "rejected").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {filteredServices.length === 0 ? (
                <div className="text-center text-gray-500">
                  You have no any active service yet.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Impressions</TableHead>
                        <TableHead>Clicks</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                <Image
                                  src={service.image || "/placeholder.svg"}
                                  alt={service.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium line-clamp-1">
                                  {service.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  LKR {service.price}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{service.impressions}</TableCell>
                          <TableCell>{service.clicks}</TableCell>
                          <TableCell>{service.appointments}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/salon-owner/services/${service.id}`}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/salon-owner/services/${service.id}/edit`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(service.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {filteredServices.length === 0 ? (
                <div className="text-center text-gray-500">
                  You have no any pending service yet.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Staff Assigned</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                <Image
                                  src={service.image || "/placeholder.svg"}
                                  alt={service.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium line-clamp-1">
                                  {service.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  LKR {service.price}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </Badge>
                          </TableCell>
                          <TableCell>{service.staffAssigned}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/salon-owner/services/${service.id}`}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/salon-owner/services/${service.id}/edit`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(service.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              {filteredServices.length === 0 ? (
                <div className="text-center text-gray-500">
                  You have no inactive or rejected services yet.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30px]">
                          <Checkbox />
                        </TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Staff Assigned</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-md overflow-hidden">
                                <Image
                                  src={service.image || "/placeholder.svg"}
                                  alt={service.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium line-clamp-1">
                                  {service.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  LKR {service.price}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {service.status === "rejected" ? (
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800"
                              >
                                Rejected by Admin
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-800"
                              >
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{service.staffAssigned}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/salon-owner/services/${service.id}`}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/salon-owner/services/${service.id}/edit`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                {service.status !== "rejected" && (
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" /> Activate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(service.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
