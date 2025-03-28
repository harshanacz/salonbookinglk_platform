"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"

// Sample notification history data
const notificationHistory = [
    {
        id: "1",
        title: "New Promotion",
        description: "Get 20% off on all services this weekend!",
        sendNow: true,
        scheduledDateTime: null,
        recipientType: "salons",
        allSalons: false,
        allClients: false,
        onlyVerifiedSalons: true,
        selectedSalons: ["1", "3"],
        selectedClients: [],
        sentAt: "2023-10-15T12:00:00Z",
        status: "Sent",
    },
    {
        id: "2",
        title: "Maintenance Alert",
        description: "Scheduled maintenance on October 20th, 2023.",
        sendNow: false,
        scheduledDateTime: "2023-10-20T08:00:00Z",
        recipientType: "clients",
        allSalons: false,
        allClients: true,
        onlyVerifiedSalons: false,
        selectedSalons: [],
        selectedClients: [],
        sentAt: "2023-10-15T12:00:00Z",
        status: "Scheduled",
    },
    {
        id: "3",
        title: "New Feature Announcement",
        description: "Check out our new booking feature!",
        sendNow: true,
        scheduledDateTime: null,
        recipientType: "all",
        allSalons: false,
        allClients: false,
        onlyVerifiedSalons: false,
        selectedSalons: [],
        selectedClients: [],
        sentAt: "2023-10-15T12:00:00Z",
        status: "Sent",
    },
]

export default function NotificationHistory() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [date, setDate] = useState<Date>()

    const filteredNotifications = notificationHistory.filter((notification) => {
        const matchesSearchTerm =
            notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notification.description.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesStatus =
            filterStatus === "all" || notification.status === filterStatus
            
        const matchesDate = !date || 
            format(new Date(notification.sentAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")

        return matchesSearchTerm && matchesStatus && matchesDate
    })

    return (
        <div>
            <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search notifications..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="lg" className="w-[240px] justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                </Popover>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Recipient Type</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredNotifications.map((notification) => (
                        <TableRow key={notification.id}>
                            <TableCell className="font-medium">{notification.title}</TableCell>
                            <TableCell>{notification.description}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {notification.recipientType}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {notification.recipientType === "salons" && (
                                    <>
                                        {notification.allSalons
                                            ? "All Salons"
                                            : notification.onlyVerifiedSalons
                                            ? "Verified Salons"
                                            : `Selected Salons (${notification.selectedSalons.length})`}
                                    </>
                                )}
                                {notification.recipientType === "clients" && (
                                    <>{notification.allClients ? "All Clients" : `Selected Clients (${notification.selectedClients.length})`}</>
                                )}
                                {notification.recipientType === "all" && "All Salons and Clients"}
                            </TableCell>
                            <TableCell>
                                {format(new Date(notification.sentAt), "PPP p")}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={notification.status === "Sent" ? "default" : "secondary"}
                                >
                                    {notification.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}