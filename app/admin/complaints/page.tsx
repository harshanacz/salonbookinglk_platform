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
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  complainant: {
    name: string;
    email: string;
    phone: string;
  };
  salon: {
    name: string;
    contact: string;
    id: string;
  };
  appointment: {
    id: string;
    date: string;
    time: number;
    serviceName: string;
    staffName: string;
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ComplaintsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [complaintsData, setComplaintsData] = useState<Complaint[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch complaints from API
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      console.log('[ADMIN_COMPLAINTS_UI] Starting fetch...');
      
      const response = await fetch('/api/admin/complaints/simple'); // Use simple endpoint for testing
      
      console.log('[ADMIN_COMPLAINTS_UI] Response status:', response.status);
      console.log('[ADMIN_COMPLAINTS_UI] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ADMIN_COMPLAINTS_UI] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('[ADMIN_COMPLAINTS_UI] Received data:', data);
      console.log('[ADMIN_COMPLAINTS_UI] Data type:', typeof data, 'Length:', Array.isArray(data) ? data.length : 'Not array');
      
      setComplaintsData(data);
      
      toast({
        title: "Success",
        description: `Loaded ${data.length} complaints`,
      });
    } catch (error) {
      console.error('[ADMIN_COMPLAINTS_UI] Error fetching complaints:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch complaints. Please try again.",
        variant: "destructive",
      });
      // Set empty array on error to avoid rendering issues
      setComplaintsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComplaints = complaintsData.filter(
    (complaint) =>
      complaint.complainant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusUpdate = async () => {
    if (!selectedComplaint) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/complaints', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintId: selectedComplaint.id,
          status: newStatus,
          adminNotes: `Status updated via admin panel`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint status');
      }

      const result = await response.json();

      // Update local state
      setComplaintsData((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === selectedComplaint.id
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      toast({
        title: "Success",
        description: result.message || `Complaint status updated to ${newStatus}`,
      });

      setIsStatusDialogOpen(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast({
        title: "Error",
        description: "Failed to update complaint status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Complaints</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading complaints...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>{complaint.complainant.name[0]}</AvatarFallback>
                        </Avatar>
                        {complaint.complainant.name}
                      </div>
                    </TableCell>
                    <TableCell>{complaint.salon.name}</TableCell>
                    <TableCell>{complaint.title}</TableCell>
                    <TableCell>
                      {formatDate(complaint.createdAt)}
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
                          complaint.priority === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : complaint.priority === "MEDIUM"
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-400 mb-2">📋</div>
                    <p className="text-gray-500 mb-2">No complaints found</p>
                    <p className="text-sm text-gray-400">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Customer complaints will appear here when submitted'}
                    </p>
                  </TableCell>
                </TableRow>
              )}
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
                <RadioGroupItem value="PENDING" id="pending" />
                <Label htmlFor="pending">Pending</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="IN_PROGRESS" id="in-progress" />
                <Label htmlFor="in-progress">In Progress</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RESOLVED" id="resolved" />
                <Label htmlFor="resolved">Resolved</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CLOSED" id="closed" />
                <Label htmlFor="closed">Closed</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
