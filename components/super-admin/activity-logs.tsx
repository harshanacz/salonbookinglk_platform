"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, RefreshCw, Download, Database } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ActivityLog {
  _id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityLogsResponse {
  activities: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  source: 'redis' | 'mongodb';
}

type ActivityLogsProps = {
  adminId: string | null;
  adminName: string | null;
};

export function ActivityLogs({ adminId, adminName }: ActivityLogsProps) {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // When admin name changes, update the search query
  useEffect(() => {
    if (adminName) {
      setSearchQuery(adminName);
    }
  }, [adminName]);

  // Fetch activities when filters change
  useEffect(() => {
    fetchActivities();
  }, [adminId, actionFilter, dateFilter, pagination.page]);

  const fetchActivities = async (resetPage: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: resetPage ? '1' : pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (adminId) params.append('adminId', adminId);
      if (actionFilter !== 'all') params.append('action', actionFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      // Add date filters
      if (dateFilter !== 'all') {
        const today = new Date();
        let startDate: Date;

        if (dateFilter === 'today') {
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        } else if (dateFilter === 'week') {
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (dateFilter === 'month') {
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else {
          startDate = today;
        }

        params.append('startDate', startDate.toISOString());
        params.append('endDate', today.toISOString());
      }

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data: ActivityLogsResponse = await response.json();
      setActivities(data.activities);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        pages: data.pages
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activity logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchActivities(true);
  };

  const handleSyncActivities = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      });

      if (!response.ok) {
        throw new Error('Failed to sync activities');
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: result.message,
      });

      // Refresh the activities list
      fetchActivities();
    } catch (error) {
      console.error('Error syncing activities:', error);
      toast({
        title: "Error",
        description: "Failed to sync activities",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-green-100 text-green-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      case 'SALON_VERIFICATION': 
      case 'SALON_STATUS_TOGGLE': return 'bg-blue-100 text-blue-800';
      case 'SERVICE_VERIFICATION':
      case 'SERVICE_STATUS_TOGGLE': return 'bg-indigo-100 text-indigo-800';
      case 'NOTIFICATION_SEND': return 'bg-purple-100 text-purple-800';
      case 'COMPLAINT_MANAGEMENT': return 'bg-yellow-100 text-yellow-800';
      case 'APPOINTMENT_APPROVAL': return 'bg-emerald-100 text-emerald-800';
      case 'ADMIN_SETTINGS_UPDATE':
      case 'ADMIN_NAME_CHANGE':
      case 'PASSWORD_CHANGE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Action</SelectLabel>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="SALON_VERIFICATION">Salon Verification</SelectItem>
                <SelectItem value="SALON_STATUS_TOGGLE">Salon Status Toggle</SelectItem>
                <SelectItem value="SERVICE_VERIFICATION">Service Verification</SelectItem>
                <SelectItem value="SERVICE_STATUS_TOGGLE">Service Status Toggle</SelectItem>
                <SelectItem value="APPOINTMENT_APPROVAL">Appointment Approval</SelectItem>
                <SelectItem value="NOTIFICATION_SEND">Notifications</SelectItem>
                <SelectItem value="COMPLAINT_MANAGEMENT">Complaints</SelectItem>
                <SelectItem value="ADMIN_SETTINGS_UPDATE">Settings</SelectItem>
                <SelectItem value="ADMIN_NAME_CHANGE">Name Change</SelectItem>
                <SelectItem value="PASSWORD_CHANGE">Password Change</SelectItem>
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

          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>

          <Button onClick={handleSyncActivities} disabled={syncing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  Loading activities...
                </TableCell>
              </TableRow>
            ) : activities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No activities found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity._id}>
                  <TableCell>
                    <div className="font-medium">{activity.adminName}</div>
                    <div className="text-sm text-muted-foreground">{activity.adminEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(activity.action)}>
                      {formatAction(activity.action)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {activity.target === 'system' ? (
                      <Badge variant="outline">System</Badge>
                    ) : (
                      activity.target
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(activity.timestamp), "PPp")}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={activity.details}>
                    {activity.details}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} activities
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Source indicator */}
      <div className="text-xs text-muted-foreground">
        Data source: MongoDB (All admin activities) | 
        Total: {pagination.total} activities
      </div>
    </div>
  );
}
