"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface Client {
  _id: string;
  name?: string;
  userName?: string;
  email?: string;
  mobileNumber?: string;
  profileImage?: string;
  totalBookings?: number;
  totalSpent?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  const fetchClients = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/users?type=CUSTOMER&page=${page}&limit=${pagination.limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const data = await response.json();
      
      // Process client data to ensure booking statistics are available
      const processedClients = data.users.map((client: Client) => ({
        ...client,
        totalBookings: client.totalBookings || 0,
        totalSpent: client.totalSpent || 0,
        lastVisit: client.lastVisit || null
      }));
      
      setClients(processedClients);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients data");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchClients(pagination.page);
  }, [pagination.limit, pagination.page]);
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const filteredClients = clients.filter(
    (client) =>
      (client.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (client.mobileNumber?.includes(searchQuery) ?? false)
  );

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Function to enrich client data with booking information
  const fetchClientBookingData = async (clientId: string) => {
    try {
      const response = await fetch(`/api/admin/bookings?clientId=${clientId}`);
      if (response.ok) {
        const bookingsData = await response.json();
        
        // Calculate booking statistics
        const totalBookings = bookingsData.length || 0;
        const totalSpent = bookingsData.reduce((sum: number, booking: any) => 
          sum + (booking.price || 0), 0);
        
        // Get last visit date (most recent booking)
        const sortedBookings = [...bookingsData].sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastVisit = sortedBookings.length > 0 ? sortedBookings[0].date : null;
        
        // Update the specific client in the clients array
        setClients(prevClients => 
          prevClients.map(client => 
            client._id === clientId 
              ? {
                  ...client,
                  totalBookings,
                  totalSpent,
                  lastVisit
                }
              : client
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching booking data for client ${clientId}:`, error);
    }
  };

  // Effect to fetch additional booking data for clients if needed
  useEffect(() => {
    if (clients.length > 0 && !isLoading) {
      // Look for clients that might need booking data
      clients.forEach(client => {
        if (
          (client.totalBookings === undefined || client.totalBookings === 0) &&
          (client.totalSpent === undefined || client.totalSpent === 0) &&
          !client.lastVisit
        ) {
          // This client likely needs booking data fetched
          fetchClientBookingData(client._id);
        }
      });
    }
  }, [clients, isLoading]);

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Client Management</CardTitle>
          <CardDescription>
            View and manage all clients across salons
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              Loading clients...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : (
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No clients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={client.profileImage || ""} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            {client.name || client.userName || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{client.email || "N/A"}</TableCell>
                        <TableCell>{client.mobileNumber || "N/A"}</TableCell>                        <TableCell>{client.totalBookings || 0}</TableCell>
                        <TableCell>
                          {client.totalSpent ? `LKR ${client.totalSpent.toLocaleString()}` : "LKR 0"}

                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/clients/${client._id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {!isLoading && !error && pagination.pages > 1 && (
          <CardFooter className="border-t py-3">
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} clients
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <div className="text-sm font-medium">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next Page</span>
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}