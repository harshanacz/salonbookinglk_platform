"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Store } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const salons = [
  {
    id: 1,
    name: "Salon Elegance",
    owner: "John Doe",
    location: "Colombo 7",
    status: "Active",
    registrationDate: "2024-01-01",
    rating: 4.8,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Beauty Hub",
    owner: "Jane Smith",
    location: "Nugegoda",
    status: "Active",
    registrationDate: "2024-01-05",
    rating: 4.5,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Glamour Studio",
    owner: "Alice Johnson",
    location: "Mount Lavinia",
    status: "Pending",
    registrationDate: "2024-01-10",
    rating: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Style Masters",
    owner: "Bob Brown",
    location: "Dehiwala",
    status: "Active",
    registrationDate: "2023-12-15",
    rating: 4.2,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Trendy Cuts",
    owner: "Eva Green",
    location: "Rajagiriya",
    status: "Suspended",
    registrationDate: "2023-11-20",
    rating: 3.9,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function SalonsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSalons = salons.filter(
    (salon) =>
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Salons</h1>
        <Button>Add New Salon</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salon Management</CardTitle>
          <CardDescription>View and manage registered salons</CardDescription>
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
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salon</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalons.map((salon) => (
                <TableRow key={salon.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={salon.avatar} />
                        <AvatarFallback>
                          <Store className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      {salon.name}
                    </div>
                  </TableCell>
                  <TableCell>{salon.owner}</TableCell>
                  <TableCell>{salon.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        salon.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : salon.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {salon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(salon.registrationDate).toLocaleDateString()}</TableCell>
                  <TableCell>{salon.rating > 0 ? `${salon.rating}/5` : "N/A"}</TableCell>
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
                        <DropdownMenuItem>Edit salon</DropdownMenuItem>
                        <DropdownMenuItem>View services</DropdownMenuItem>
                        <DropdownMenuItem>Contact owner</DropdownMenuItem>
                        {salon.status === "Active" && (
                          <DropdownMenuItem className="text-red-600">Suspend salon</DropdownMenuItem>
                        )}
                        {salon.status === "Suspended" && (
                          <DropdownMenuItem className="text-green-600">Reactivate salon</DropdownMenuItem>
                        )}
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

