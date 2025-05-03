"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, User } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Salon = {
  id: string;
  name: string;
  image: string;
  email: string;
  contactNumber: string;
  location: string;
  status: string;
};

const Page = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/users?type=SALON_OWNER");

        if (!response.ok) {
          throw new Error("Failed to fetch salons");
        }

        const data = await response.json();

        // Map the API data to the Salon type
        const formattedSalons: Salon[] = data.map((salon: any) => ({
          id: salon._id,
          name: salon.userName || "Unnamed Salon",
          image: salon.profileImage || "",
          email: salon.email || "",
          contactNumber: salon.phoneNumber || salon.contactNumber || "",
          location: salon.address || salon.location || "",
          status: salon.status || "Pending",
        }));

        setSalons(formattedSalons);
      } catch (error) {
        console.error("Error fetching salons:", error);
        setError("Failed to load salons. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalons();
  }, []);

  const filteredSalons = salons.filter((salon) => {
    const matchesSearch = salon.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || salon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Salon Directory</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Salons</CardTitle>
          <CardDescription>
            View and manage all registered salons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search salons..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading salons...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Salon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalons.length > 0 ? (
                  filteredSalons.map((salon: Salon) => (
                    <TableRow key={salon.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={salon.image} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span>{salon.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{salon.email}</TableCell>
                      <TableCell>{salon.contactNumber}</TableCell>
                      <TableCell>{salon.location}</TableCell>
                      <TableCell>
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
                          {salon.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/salons/${salon.id}`}>
                          <Button size="sm">
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No salons found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
