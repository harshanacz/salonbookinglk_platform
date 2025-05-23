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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Salon {
  id: string;
  name: string;
}

interface ReportData {
  stats: {
    totalRevenue: number;
    totalAppointments: number;
    activeSalons: number;
    newSalonsThisMonth: number;
    customerSatisfaction: number;
  };
  appointmentsData: {
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  popularServices: Array<{
    title: string;
    count: number;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
  salons: Salon[];
}

export default function AdminReportsPage() {  // States
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedSalon, setSelectedSalon] = useState<string>("all");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Replace CSS variables with direct color values
  const siteColors = {
    primary: "#6a0dad", // Blue
    secondary: "#8e44ad", // Purple
    accent1: "#4caf50", // Green
    accent2: "#da9021", // Orange
    accent3: "#06B6D4", // Cyan
    danger: "#EF4444", // Red
  };
  useEffect(() => {
    fetchReportData();
    // Only fetch again when salon changes, not on date range changes
    // Date range changes will be applied when the Apply button is clicked
  }, [selectedSalon]);
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const from = dateRange.from.toISOString();
      const to = dateRange.to ? dateRange.to.toISOString() : new Date().toISOString();
      
      const url = `/api/admin/reports?from=${from}&to=${to}&salonId=${selectedSalon}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if the current date range is different from the default (last 30 days)
  const isCustomDateRange = () => {
    const defaultStartDate = subDays(new Date(), 30);
    const defaultEndDate = new Date();
    
    // Reset time parts for accurate comparison
    defaultStartDate.setHours(0, 0, 0, 0);
    defaultEndDate.setHours(0, 0, 0, 0);
    
    const currentStartDate = new Date(dateRange.from);
    currentStartDate.setHours(0, 0, 0, 0);
    
    // If no end date or different start date, it's custom
    if (!dateRange.to) return true;
    
    const currentEndDate = new Date(dateRange.to);
    currentEndDate.setHours(0, 0, 0, 0);
    
    return currentStartDate.getTime() !== defaultStartDate.getTime() || 
           currentEndDate.getTime() !== defaultEndDate.getTime();
  };

  // Prepare chart data from API response
  const revenueData = {
    labels: reportData?.revenueData.map(item => item.month) || [],
    datasets: [
      {
        label: "Revenue",
        data: reportData?.revenueData.map(item => item.revenue) || [],
        backgroundColor: siteColors.secondary.replace("0.8", "0.6"),
        borderColor: siteColors.secondary,
      },
    ],
  };

  const appointmentsData = reportData ? {
    labels: ["Confirmed", "Pending", "Completed", "Cancelled"],
    datasets: [
      {
        data: [
          reportData.appointmentsData.confirmed,
          reportData.appointmentsData.pending,
          reportData.appointmentsData.completed,
          reportData.appointmentsData.cancelled,
        ],
        backgroundColor: [
          siteColors.accent1,
          siteColors.accent2,
          siteColors.primary,
          siteColors.danger,
        ],
        borderWidth: 1,
      },
    ],
  } : {
    labels: ["Confirmed", "Pending", "Completed", "Cancelled"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: [], borderWidth: 1 }],
  };

  const popularServicesData = {
    labels: reportData?.popularServices.map(service => service.title) || [],
    datasets: [
      {
        label: "Bookings",
        data: reportData?.popularServices.map(service => service.count) || [],
        borderColor: siteColors.secondary,
        backgroundColor: siteColors.secondary.replace("0.8", "0.2"),
        tension: 0.1,
      },
    ],
  };

  // Chart options for controlling size
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        padding: 10,
        bodyFont: {
          size: 12
        }
      }
    }
  };

  // Add additional options for better bar chart appearance
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const
      },
      tooltip: {
        padding: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={isCustomDateRange() ? "default" : "outline"}
              size="lg"
              className="justify-start text-left font-normal w-full md:w-auto"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="space-y-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  // Handle partial selections too, so users can see the "from" date even before selecting "to"
                  if (range?.from) {
                    setDateRange({ 
                      from: range.from, 
                      to: range.to || dateRange.to 
                    });
                  }
                }}
                numberOfMonths={2}              />
              <div className="flex items-center justify-end gap-2 px-3 pb-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setDateRange({
                      from: subDays(new Date(), 30),
                      to: new Date()
                    });
                    setIsCalendarOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsCalendarOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={() => {
                    fetchReportData();
                    setIsCalendarOpen(false);
                  }}
                >
                  Apply
                </Button>
              </div>            </div>
          </PopoverContent>
        </Popover>
        <Select value={selectedSalon} onValueChange={setSelectedSalon}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Select salon" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Salons</SelectItem>
            {reportData?.salons.map((salon) => (
              <SelectItem key={salon.id} value={salon.id}>
                {salon.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline"
          onClick={fetchReportData}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <span className="mr-2">↻</span>
          )}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3">Loading report data...</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  LKR {reportData?.stats.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  For the selected period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.stats.totalAppointments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  For the selected period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Salons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.stats.activeSalons}</div>
                <p className="text-xs text-muted-foreground">
                  +{reportData?.stats.newSalonsThisMonth} new this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.stats.customerSatisfaction}/5</div>
                <p className="text-xs text-muted-foreground">
                  Based on customer reviews
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="services">Popular Services</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>
                    Monthly revenue {selectedSalon === "all" ? "across all salons" : "for selected salon"}
                  </CardDescription>
                </CardHeader>                <CardContent>
                  {reportData?.revenueData.length ? (
                    <div className="w-full h-[400px]">
                      <Bar data={revenueData} options={barChartOptions} />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-12 text-muted-foreground">
                      No revenue data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Statistics</CardTitle>
                  <CardDescription>
                    Distribution of appointments by status
                  </CardDescription>
                </CardHeader>                <CardContent>
                  {Object.values(reportData?.appointmentsData || {}).some(val => val > 0) ? (
                    <div className="w-full h-[400px] flex justify-center items-center">
                      <Pie data={appointmentsData} options={pieChartOptions} />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-12 text-muted-foreground">
                      No appointment data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                  <CardDescription>Top 5 most booked services</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData?.popularServices.length ? (
                    <div className="w-full h-[400px]">
                      <Line data={popularServicesData} options={lineChartOptions} />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-12 text-muted-foreground">
                      No service data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
