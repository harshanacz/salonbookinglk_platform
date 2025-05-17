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
import { UserType } from "@/models/User";

// Extended client interface to match our data model
interface Client {
  _id: string;
  name?: string;
  userName?: string;
  email?: string;
  mobileNumber?: string;
  profileImage?: string;
  totalBookings?: number;
  totalSpent?: number;
  lastVisit?: string;
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
      setClients(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchClients(newPage);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      "" ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      "" ||
      client.mobileNumber?.includes(searchQuery) ||
      ""
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clients</h1>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>
            View and manage all clients across salons
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
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
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
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
                            {client.userName || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>{client.email || "N/A"}</TableCell>
                        <TableCell>{client.mobileNumber || "N/A"}</TableCell>
                        <TableCell>{client.totalBookings || 0}</TableCell>
                        <TableCell>
                          LKR {(client.totalSpent || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {client.lastVisit
                            ? new Date(client.lastVisit).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm">
                            <Link href={`/admin/clients/${client._id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {!isLoading && !error && pagination.pages > 1 && (
          <CardFooter className="flex justify-between items-center">
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
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
