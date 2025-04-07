"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Sample staff data
const staffMembers = [
  {
    id: 1,
    name: "Dhanuka Perera",
    image: "/placeholder.svg?height=40&width=40",
    role: "Senior Stylist",
    services: ["Hair Coloring", "Haircut", "Hair Styling"],
    status: "Active",
    availability: "Full-time",
    joinedDate: "Jan 15, 2023",
  },
  {
    id: 2,
    name: "Samantha Silva",
    image: "/placeholder.svg?height=40&width=40",
    role: "Nail Technician",
    services: ["Manicure", "Pedicure", "Nail Art"],
    status: "Active",
    availability: "Part-time",
    joinedDate: "Mar 22, 2023",
  },
  {
    id: 3,
    name: "Priyanka Jayawardena",
    image: "/placeholder.svg?height=40&width=40",
    role: "Beautician",
    services: ["Facial", "Makeup", "Waxing"],
    status: "Active",
    availability: "Full-time",
    joinedDate: "Feb 10, 2023",
  },
  {
    id: 4,
    name: "Nimal Fernando",
    image: "/placeholder.svg?height=40&width=40",
    role: "Junior Stylist",
    services: ["Haircut", "Hair Styling"],
    status: "Inactive",
    availability: "Part-time",
    joinedDate: "Apr 5, 2023",
  },
  {
    id: 5,
    name: "Kumari Perera",
    image: "/placeholder.svg?height=40&width=40",
    role: "Massage Therapist",
    services: ["Body Massage", "Foot Massage"],
    status: "Active",
    availability: "Full-time",
    joinedDate: "May 18, 2023",
  },
 {    id: 6,
    name: "Pubudu Maduranga",
    image: "/placeholder.svg?height=40&width=40",
    role: "Massage Therapist",
    services: ["Customer Service", "Appointment Scheduling"],
    status: "Inactive",   
    availability: "Full-time",
    joinedDate: "Jun 12, 2023",}
];

export default function StaffManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStaff = staffMembers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.services.some((service) =>
        service.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/salon-owner/staff/create">
              <Plus className="mr-2 h-4 w-4" /> Add Staff Member
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            Manage your salon staff and their service assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                {/* <TableHead>Services</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={staff.image || "/placeholder.svg"}
                          alt={staff.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-medium">{staff.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{staff.role}</TableCell>
                  {/* <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {staff.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </TableCell> */}
                  <TableCell>
                    <Badge
                      variant={
                        staff.status === "Active" ? "default" : "secondary"
                      }
                      className={
                        staff.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{staff.availability}</TableCell>
                  <TableCell>{staff.joinedDate}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/salon-owner/staff/update_attendace?id=${staff.id}`}>
                            Update Attendance
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/salon-owner/staff/edit?id=${staff.id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
