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
import { useToast } from "@/components/ui/use-toast";

interface StaffMember {
  _id: string;
  name: string;
  image?: string;
  role: string;
  services: string[];
  status: string;
  availability: string;
  createdAt: string;
}

export default function StaffManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch('/api/salon-owner/staff');
        if (!response.ok) {
          throw new Error('Failed to fetch staff members');
        }
        const data = await response.json();
        setStaffMembers(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load staff members",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStaff();
  }, []);

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

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff._id}>
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
                    <TableCell>
                      <Badge
                        variant={staff.status === "Active" ? "default" : "secondary"}
                        className={staff.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                        }
                      >
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{staff.availability}</TableCell>
                    <TableCell>
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/salon-owner/staff/update-attendance?id=${staff._id}`}>
                              Update Attendance
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/salon-owner/staff/edit?id=${staff._id}`}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
