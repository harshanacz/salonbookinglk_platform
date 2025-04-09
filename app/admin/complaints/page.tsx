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
import { MoreHorizontal, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const complaints = [
  {
    id: 1,
    client: "John Doe",
    salon: "Salon Elegance",
    subject: "Poor service quality",
    date: "2024-01-15",
    status: "Open",
    priority: "High",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    client: "Jane Smith",
    salon: "Beauty Hub",
    subject: "Booking system error",
    date: "2024-01-14",
    status: "In Progress",
    priority: "Medium",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    client: "Alice Johnson",
    salon: "Glamour Studio",
    subject: "Refund request",
    date: "2024-01-13",
    status: "Closed",
    priority: "Low",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    client: "Bob Brown",
    salon: "Style Masters",
    subject: "Unprofessional staff behavior",
    date: "2024-01-12",
    status: "Open",
    priority: "High",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    client: "Eva Green",
    salon: "Trendy Cuts",
    subject: "Appointment scheduling issues",
    date: "2024-01-11",
    status: "In Progress",
    priority: "Medium",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function ComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [complaintsData, setComplaintsData] = useState(complaints);

  const filteredComplaints = complaintsData.filter(
    (complaint) =>
      complaint.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.salon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusUpdate = () => {
    if (!selectedComplaint) return;

    setComplaintsData((prevComplaints) =>
      prevComplaints.map((complaint) =>
        complaint.id === selectedComplaint.id
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );
    
    // You would typically make an API call here to update the status
    console.log(`Updated complaint ${selectedComplaint.id} status to ${newStatus}`);
    setIsStatusDialogOpen(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Complaints</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Management</CardTitle>
          <CardDescription>View and manage customer complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Salon</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={complaint.avatar} />
                        <AvatarFallback>{complaint.client[0]}</AvatarFallback>
                      </Avatar>
                      {complaint.client}
                    </div>
                  </TableCell>
                  <TableCell>{complaint.salon}</TableCell>
                  <TableCell>{complaint.subject}</TableCell>
                  <TableCell>
                    {new Date(complaint.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusStyle(complaint.status)}
                    >
                      {complaint.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        complaint.priority === "High"
                          ? "bg-red-100 text-red-800"
                          : complaint.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {complaint.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/complaints/view_complaint?id=${complaint.id}`}>
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus(complaint.status);
                            setIsStatusDialogOpen(true);
                          }}
                        >
                          Update status
                        </DropdownMenuItem>
                        <DropdownMenuItem>Notify client</DropdownMenuItem>
                        <DropdownMenuItem>Notify salon</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <RadioGroup
              value={newStatus}
              onValueChange={setNewStatus}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Open" id="open" />
                <Label htmlFor="open">Open</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="In Progress" id="in-progress" />
                <Label htmlFor="in-progress">In Progress</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Resolved" id="resolved" />
                <Label htmlFor="resolved">Resolved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Closed" id="closed" />
                <Label htmlFor="closed">Closed</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
