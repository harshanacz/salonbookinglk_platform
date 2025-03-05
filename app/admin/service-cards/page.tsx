"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Sample services data
const services = [
  {
    id: 1,
    title: "Custom Hair Coloring And Highlights | Red, Black, Gray Colors",
    image: "/placeholder.svg?height=100&width=100",
    salon: "Salon Amaya",
    status: "NEW",
    startedDate: "-",
    updatedDate: "Dec 16",
  },
  {
    id: 2,
    title: "Acrylic Nail Extensions With Custom Art",
    image: "/placeholder.svg?height=100&width=100",
    salon: "Beauty Hub",
    status: "UPDATE",
    startedDate: "Nov 11",
    updatedDate: "Dec 16",
  },
  {
    id: 3,
    title: "Full Body Massage with Essential Oils",
    image: "/placeholder.svg?height=100&width=100",
    salon: "Wellness Spa",
    status: "NEW",
    startedDate: "-",
    updatedDate: "Dec 15",
  },
  {
    id: 4,
    title: "Bridal Makeup Package",
    image: "/placeholder.svg?height=100&width=100",
    salon: "Glamour Studio",
    status: "UPDATE",
    startedDate: "Oct 25",
    updatedDate: "Dec 14",
  },
  {
    id: 5,
    title: "Men's Haircut and Styling",
    image: "/placeholder.svg?height=100&width=100",
    salon: "Style Masters",
    status: "NEW",
    startedDate: "-",
    updatedDate: "Dec 13",
  },
]

export default function ServiceCards() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.salon.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pending Approval</h1>
        <div className="text-sm text-gray-500">Last 30 Days</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Cards</CardTitle>
          <CardDescription>Review and approve salon services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started Date</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden">
                          <Image
                            src={service.image || "/placeholder.svg"}
                            alt={service.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium line-clamp-1">{service.title}</div>
                          <div className="text-sm text-gray-500">{service.salon}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          service.status === "NEW" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.startedDate}</TableCell>
                    <TableCell>{service.updatedDate}</TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/service-cards/${service.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

