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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

// Define service type
interface Service {
  id: string;
  title: string;
  image: string;
  salon: string;
  status: string;
  startedDate: string;
  updatedDate: string;
}

export default function ServiceCards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch pending services on component mount
  useEffect(() => {
    const fetchPendingServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/service-cards');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error("Failed to fetch pending services:", err);
        setError("Failed to load pending services. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load pending services. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPendingServices();
  }, [toast]);

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.salon.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pending Approval</h1>
        <div className="text-sm text-gray-500">Last 30 Days</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Cards</CardTitle>
          <CardDescription>Review and approve salon services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {searchQuery ? "No services match your search" : "No pending services found"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started Date</TableHead>
                    <TableHead>Updated Date</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2 rounded-md overflow-hidden">
                            <AvatarImage src={service.image} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium line-clamp-1">
                              {service.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {service.salon}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            service.status === "NEW" ? "default" : "secondary"
                          }
                        >
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{service.startedDate}</TableCell>
                      <TableCell>{service.updatedDate}</TableCell>
                      <TableCell>
                        <Button asChild size="sm">
                          <Link href={`/admin/service-cards/${service.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
