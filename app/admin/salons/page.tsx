"use client";
import React from "react";
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

  // Sample salon data
  const salonData: Salon[] = [
    {
      id: "1",
      name: "Elegance Salon",
      image: "",
      email: "elegance@example.com",
      contactNumber: "+94 75 123 4567",
      location: "Colombo 03",
      status: "Approved",
    },
    {
      id: "2",
      name: "Glamour Studio",
      image: "",
      email: "glamour@example.com",
      contactNumber: "+94 77 987 6543",
      location: "Kandy",
      status: "Approved",
    },
    {
      id: "3",
      name: "Bliss Beauty",
      image: "",
      email: "bliss@example.com",
      contactNumber: "+94 71 456 7890",
      location: "Galle",
      status: "Pending",
    },
    {
      id: "4",
      name: "Trendy Cuts",
      image: "",
      email: "trendy@example.com",
      contactNumber: "+94 76 234 5678",
      location: "Negombo",
      status: "Rejected",
    },
  ];

  const filteredSalons = salonData.filter((salon) => {
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
              {filteredSalons.map((salon: Salon) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
