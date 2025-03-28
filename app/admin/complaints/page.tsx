"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
]

export default function ComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredComplaints = complaints.filter(
    (complaint) =>
      complaint.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.salon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
                  <TableCell>{new Date(complaint.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        complaint.status === "Open"
                          ? "bg-red-100 text-red-800"
                          : complaint.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }
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
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Update status</DropdownMenuItem>
                        <DropdownMenuItem>Assign to staff</DropdownMenuItem>
                        <DropdownMenuItem>Contact client</DropdownMenuItem>
                        <DropdownMenuItem>Contact salon</DropdownMenuItem>
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
  )
}

