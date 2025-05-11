"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

interface Notification {
  _id: string;
  title: string;
  description: string;
  recipientType: string;
  allSalons: boolean;
  allClients: boolean;
  onlyVerifiedSalons: boolean;
  selectedSalons: Array<{ _id: string; name?: string; userName?: string; email?: string }>;
  selectedClients: Array<{ _id: string; name?: string; userName?: string; email?: string }>;
  sentBy: {
    _id: string;
    email: string;
    userName?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
  emailSent: boolean;
  emailSentAt?: string;
  emailError?: string;
  emailRecipientsCount: number;
  __v: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function NotificationHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [date, setDate] = useState<Date | undefined>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (recipientType !== "all") {
        queryParams.append("recipientType", recipientType);
      }

      if (date) {
        queryParams.append("date", format(date, "yyyy-MM-dd"));
      }

      const response = await fetch(`/api/admin/notifications?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, recipientType, date]);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearchTerm =
      !searchQuery ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearchTerm;
  });

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Notification History</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
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
              <Button
                variant="outlineDate"
                className="w-full md:w-[240px] justify-start text-left font-normal h-10"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select 
            value={recipientType} 
            onValueChange={(value) => {
              setRecipientType(value);
              setPagination(prev => ({ ...prev, page: 1 })); 
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by recipient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recipients</SelectItem>
              <SelectItem value="salons">Salons</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No notifications found
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[250px]">Description</TableHead>
                  <TableHead className="w-[150px] min-w-[150px]">Recipient Type</TableHead>
                  <TableHead className="w-[200px] min-w-[200px]">Recipients</TableHead>
                  <TableHead className="w-[180px] min-w-[180px]">Email Status</TableHead>
                  <TableHead className="w-[180px] min-w-[180px]">Sent At</TableHead>
                  <TableHead className="w-[180px] min-w-[180px]">Sent By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {notification.title}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="line-clamp-2">
                        {notification.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {notification.recipientType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {notification.recipientType === "salons" && (
                        <div className="space-y-1">
                          {notification.allSalons ? (
                            <div>All Salons</div>
                          ) : notification.onlyVerifiedSalons ? (
                            <div>Verified Salons</div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span>Selected Salons ({notification.selectedSalons?.length || 0})</span>
                              {notification.selectedSalons?.length > 0 && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-left">
                                      View Details
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 max-h-80 overflow-auto">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Selected Salons</h4>
                                      <div className="space-y-2">
                                        {notification.selectedSalons.map((salon) => (
                                          <div key={salon._id} className="border-b pb-2">
                                            <div className="font-medium">{salon.userName || salon.name || "No name"}</div>
                                            <div className="text-sm text-muted-foreground">{salon.email || "No email"}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {notification.recipientType === "clients" && (
                        <div className="space-y-1">
                          {notification.allClients ? (
                            <div>All Clients</div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span>Selected Clients ({notification.selectedClients?.length || 0})</span>
                              {notification.selectedClients?.length > 0 && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-left">
                                      View Details
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 max-h-80 overflow-auto">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Selected Clients</h4>
                                      <div className="space-y-2">
                                        {notification.selectedClients.map((client) => (
                                          <div key={client._id} className="border-b pb-2">
                                            <div className="font-medium">{client.userName || client.name || "No name"}</div>
                                            <div className="text-sm text-muted-foreground">{client.email || "No email"}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {notification.recipientType === "all" && "All Salons and Clients"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {notification.emailSent ? (
                          <>
                            <Badge variant="secondary">Sent</Badge>
                            {notification.emailSentAt && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(notification.emailSentAt), 'PPpp')}
                              </span>
                            )}
                            {notification.emailRecipientsCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({notification.emailRecipientsCount} recipients)
                              </span>
                            )}
                          </>
                        ) : notification.emailError ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="flex items-center gap-1">
                                <Badge variant="destructive">Failed</Badge>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">Email Failed</h4>
                                <p className="text-sm text-muted-foreground break-words">
                                  {notification.emailError}
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <Badge variant="secondary">Not Sent</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(notification.createdAt), "PPp")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium truncate">
                          {notification.sentBy?.userName || notification.sentBy?.email || "System"}
                        </span>
                        {notification.sentBy?.email && (
                          <span className="text-xs text-muted-foreground truncate">
                            {notification.sentBy.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredNotifications.length} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}