"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Calendar } from "lucide-react"
import { format } from "date-fns"

// Mock data for activity logs
const mockActivities = [
  {
    id: "1",
    adminId: "1",
    adminName: "John Doe",
    action: "Logged in",
    timestamp: new Date(2023, 2, 15, 14, 30),
    details: "Successful login from IP 192.168.1.1",
  },
  {
    id: "2",
    adminId: "1",
    adminName: "John Doe",
    action: "Updated admin",
    timestamp: new Date(2023, 2, 15, 15, 45),
    details: "Updated admin profile for Jane Smith",
  },
  {
    id: "3",
    adminId: "2",
    adminName: "Jane Smith",
    action: "Added admin",
    timestamp: new Date(2023, 2, 14, 9, 45),
    details: "Added new admin: Michael Wilson",
  },
  {
    id: "4",
    adminId: "2",
    adminName: "Jane Smith",
    action: "Logged out",
    timestamp: new Date(2023, 2, 14, 17, 30),
    details: "Session ended",
  },
  {
    id: "5",
    adminId: "3",
    adminName: "Robert Johnson",
    action: "Deleted admin",
    timestamp: new Date(2023, 2, 10, 16, 20),
    details: "Deleted admin account for user #12345",
  },
  {
    id: "6",
    adminId: "4",
    adminName: "Emily Davis",
    action: "Modified settings",
    timestamp: new Date(2023, 2, 13, 11, 15),
    details: "Updated system settings",
  },
  {
    id: "7",
    adminId: "5",
    adminName: "Michael Wilson",
    action: "Logged in",
    timestamp: new Date(2023, 2, 8, 10, 0),
    details: "Successful login from IP 192.168.1.5",
  },
]

type ActivityLogsProps = {
  adminId: string | null
}

export function ActivityLogs({ adminId }: ActivityLogsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredActivities = mockActivities
    .filter((activity) => {
      // Filter by admin if adminId is provided
      if (adminId && activity.adminId !== adminId) {
        return false
      }

      // Filter by search query
      const matchesSearch =
        activity.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.details.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by action type
      const matchesAction = actionFilter === "all" || activity.action.toLowerCase().includes(actionFilter.toLowerCase())

      // Filter by date
      let matchesDate = true
      const today = new Date()
      const activityDate = new Date(activity.timestamp)

      if (dateFilter === "today") {
        matchesDate =
          activityDate.getDate() === today.getDate() &&
          activityDate.getMonth() === today.getMonth() &&
          activityDate.getFullYear() === today.getFullYear()
      } else if (dateFilter === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(today.getDate() - 7)
        matchesDate = activityDate >= weekAgo
      } else if (dateFilter === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(today.getMonth() - 1)
        matchesDate = activityDate >= monthAgo
      }

      return matchesSearch && matchesAction && matchesDate
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by most recent

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Action</SelectLabel>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="logged in">Login</SelectItem>
                <SelectItem value="logged out">Logout</SelectItem>
                <SelectItem value="updated">Update</SelectItem>
                <SelectItem value="added">Add</SelectItem>
                <SelectItem value="deleted">Delete</SelectItem>
                <SelectItem value="modified">Modify</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Date Range</SelectLabel>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No activities found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.adminName}</TableCell>
                  <TableCell>{activity.action}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(activity.timestamp, "PPp")}
                    </div>
                  </TableCell>
                  <TableCell>{activity.details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

