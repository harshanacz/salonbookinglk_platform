"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import "@/styles/pdf-report.css";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, Loader2, Search } from "lucide-react";
import { format, subDays } from "date-fns";
import { Bar, Line, Pie } from "react-chartjs-2";
import { generatePdf } from "@/utils/generatePdf"; 
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
    activeSalons?: number;
    verified?: number;
    totalSalons?: number;
    newSalonsThisMonth?: number;
    customerSatisfaction: number;
    lostRevenue?: number;
  };
  appointmentsData: {
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
    confirmedRevenue?: number;
    pendingRevenue?: number;
    completedRevenue?: number;
    cancelledRevenue?: number;
  };
  popularServices: Array<{
    title: string;
    count: number;
    salonName?: string;
    revenue?: number;
  }>;
  popularSalons?: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  topSalons?: Array<{
    id: string;
    name: string;
    revenue: number;
    appointments: number;
    services: number;
    rating: number;
    location: string;
  }>;
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
  salons: Salon[];
}

export default function AdminReportsPage() {
  // States
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedSalon, setSelectedSalon] = useState<string>("all");
  const [salonSearch, setSalonSearch] = useState<string>("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

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

  // Filter salons based on search
  const filteredSalons = reportData?.salons.filter(salon =>
    salon.name.toLowerCase().includes(salonSearch.toLowerCase())
  ) || [];

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const from = dateRange.from.toISOString();
      const to = dateRange.to
        ? dateRange.to.toISOString()
        : new Date().toISOString();

      const url = `/api/admin/reports?from=${from}&to=${to}&salonId=${selectedSalon}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const data = await response.json();
      console.log("API Response:", data); // Debug log
      console.log("popularServices in response:", data.popularServices); // Debug log
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

    return (
      currentStartDate.getTime() !== defaultStartDate.getTime() ||
      currentEndDate.getTime() !== defaultEndDate.getTime()
    );
  };

  // Prepare chart data from API response
  const revenueData = {
    labels: reportData?.revenueData.map((item) => item.month) || [],
    datasets: [
      {
        label: "Revenue",
        data: reportData?.revenueData.map((item) => item.revenue) || [],
        backgroundColor: siteColors.secondary.replace("0.8", "0.6"),
        borderColor: siteColors.secondary,
      },
    ],
  };

  const appointmentsData = reportData
    ? {
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
      }
    : {
        labels: ["Confirmed", "Pending", "Completed", "Cancelled"],
        datasets: [{ data: [0, 0, 0, 0], backgroundColor: [], borderWidth: 1 }],
      };

  const popularServicesData = {
    labels: reportData?.popularServices.map((service) => service.title) || [],
    datasets: [
      {
        label: "Bookings",
        data: reportData?.popularServices.map((service) => service.count) || [],
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
            size: 12,
          },
        },
      },
      tooltip: {
        padding: 10,
        bodyFont: {
          size: 12,
        },
      },
    },
  };

  // Add additional options for better bar chart appearance
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Function to handle PDF export
  const handleExportPdf = async () => {
    if (!reportContentRef.current || !reportData) return;

    try {
      setIsPdfLoading(true);

      // Create a summary object with all string values
      const summary = {
        "Total Revenue": `LKR ${reportData.stats.totalRevenue.toLocaleString()}`,
        "Total Appointments": reportData.stats.totalAppointments.toLocaleString(),
        "Verified Salons": (reportData.stats.verified || reportData.stats.activeSalons || 0).toString(),
        "Total Salons": (reportData.stats.totalSalons || 0).toString(),
        "Lost Revenue": `LKR ${(reportData.stats.lostRevenue || 0).toLocaleString()}`,
      };

      // Show summary table before generating PDF
      setShowSummaryTable(true);

      // Wait a moment for the table to render
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Generate the file name based on date range and salon
      const fromDate = format(dateRange.from, "yyyy-MM-dd");
      const toDate = dateRange.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      const salonName =
        selectedSalon === "all"
          ? "All-Salons"
          : reportData.salons
              .find((s) => s.id === selectedSalon)
              ?.name.replace(/\s+/g, "-") || selectedSalon;

      const filename = `SalonBooking-Report-${salonName}-${fromDate}-to-${toDate}.pdf`;

      // Generate the subtitle based on salon selection
      const subtitle =
        selectedSalon === "all"
          ? "Report for All Salons"
          : `Report for ${
              reportData.salons.find((s) => s.id === selectedSalon)?.name
            }`;
      await generatePdf(reportContentRef.current, {
        filename,
        title: "SalonBooking.lk - Report", 
        subtitle,
        dateRange: {
          from: dateRange.from,
          to: dateRange.to,
        },
        summary,
        companyDetails: {
          name: "SalonBooking.lk",
          website: "www.salonbooking.lk",
        },
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Hide summary table after PDF generation
      setShowSummaryTable(false);
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button
          onClick={handleExportPdf}
          disabled={loading || !reportData || isPdfLoading}
        >
          {isPdfLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isPdfLoading ? "Generating PDF..." : "Export Report"}
        </Button>
      </div>{" "}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
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
                      to: range.to || dateRange.to,
                    });
                  }
                }}
                numberOfMonths={2}
              />
              <div className="flex items-center justify-end gap-2 px-3 pb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateRange({
                      from: subDays(new Date(), 30),
                      to: new Date(),
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
              </div>{" "}
            </div>
          </PopoverContent>
        </Popover>
        <Select value={selectedSalon} onValueChange={setSelectedSalon}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Select salon" />
          </SelectTrigger>
          <SelectContent>
            <div className="flex items-center px-3 py-2 border-b">
              <Search className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                placeholder="Search salons..."
                value={salonSearch}
                onChange={(e) => setSalonSearch(e.target.value)}
                className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <SelectItem value="all">All Salons</SelectItem>
            {filteredSalons.map((salon) => (
              <SelectItem key={salon.id} value={salon.id}>
                {salon.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchReportData} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <span className="mr-2">↻</span>
          )}
          Refresh
        </Button>
      </div>{" "}
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
        <div ref={reportContentRef} className="space-y-6">
          {/* Company Header (Only visible when generating PDF) */}{" "}
          {showSummaryTable && (
            <div className="mb-2">
              <div className="text-center mb-1 pdf-header">
                <h2 className="text-3xl font-bold">SalonBooking.lk - Report</h2>
              </div>
              <div className="text-center mb-2">
                <p className="text-lg font-medium text-muted-foreground">
                  {selectedSalon === "all"
                    ? "Report for All Salons"
                    : `Report for ${
                        reportData?.salons.find((s) => s.id === selectedSalon)
                          ?.name
                      }`} - Period: {format(dateRange.from, "LLL dd, y")} -{" "}
                  {dateRange.to
                    ? format(dateRange.to, "LLL dd, y")
                    : format(new Date(), "LLL dd, y")}
                </p>
              </div>
              {/* Two-column layout for Summary and Appointment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="border rounded-md p-2 pdf-section">
                  <h4 className="font-medium mb-3">Summary</h4>
                  <table className="w-full pdf-report-table">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Metric</th>
                        <th className="text-right py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Total Revenue</td>
                        <td className="text-right py-2">
                          LKR {reportData?.stats.totalRevenue.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Total Appointments</td>
                        <td className="text-right py-2">
                          {reportData?.stats.totalAppointments.toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Verified Salons</td>
                        <td className="text-right py-2">
                          {reportData?.stats.verified || reportData?.stats.activeSalons || 0}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Total Salons</td>
                        <td className="text-right py-2">
                          {reportData?.stats.totalSalons || 0}
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Lost Revenue (Cancelled)</td>
                        <td className="text-right py-2 text-red-600">
                          LKR {(reportData?.stats.lostRevenue || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Always show Appointment Statistics */}
                {reportData?.appointmentsData && (
                  <div className="border rounded-md p-2 pdf-section">
                    <h4 className="font-medium mb-3">Appointment Statistics</h4>
                    <table className="w-full pdf-report-table">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Status</th>
                          <th className="text-right py-2">Count</th>
                          <th className="text-right py-2">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Confirmed</td>
                          <td className="text-right py-2">
                            {reportData.appointmentsData.confirmed || 0}
                          </td>
                          <td className="text-right py-2">
                            LKR {(reportData.appointmentsData.confirmedRevenue || 0).toLocaleString()}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Pending</td>
                          <td className="text-right py-2">
                            {reportData.appointmentsData.pending || 0}
                          </td>
                          <td className="text-right py-2">
                            LKR {(reportData.appointmentsData.pendingRevenue || 0).toLocaleString()}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Completed</td>
                          <td className="text-right py-2">
                            {reportData.appointmentsData.completed || 0}
                          </td>
                          <td className="text-right py-2">
                            LKR {(reportData.appointmentsData.completedRevenue || 0).toLocaleString()}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Cancelled</td>
                          <td className="text-right py-2">
                            {reportData.appointmentsData.cancelled || 0}
                          </td>
                          <td className="text-right py-2 text-red-600">
                            LKR {(reportData.appointmentsData.cancelledRevenue || 0).toLocaleString()}
                          </td>
                        </tr>
                        <tr className="border-b font-medium">
                          <td className="py-2">Total</td>
                          <td className="text-right py-2">
                            {(reportData.appointmentsData.confirmed || 0) +
                             (reportData.appointmentsData.pending || 0) +
                             (reportData.appointmentsData.completed || 0) +
                             (reportData.appointmentsData.cancelled || 0)}
                          </td>
                          <td className="text-right py-2">
                            LKR {((reportData.appointmentsData.confirmedRevenue || 0) +
                             (reportData.appointmentsData.pendingRevenue || 0) +
                             (reportData.appointmentsData.completedRevenue || 0) +
                             (reportData.appointmentsData.cancelledRevenue || 0)).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Popular Services - Always show top 8 services with salon names */}
              {reportData?.popularServices &&
                reportData.popularServices.length > 0 && (
                  <div className="border rounded-md p-2 mb-3 pdf-section">
                    <h4 className="font-medium mb-3">Most Popular Services</h4>
                    <table className="w-full pdf-report-table">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Service</th>
                          <th className="text-left py-2">Salon</th>
                          <th className="text-right py-2">Bookings</th>
                          <th className="text-right py-2">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.popularServices
                          .slice(0, 8)
                          .map((service, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{service.title}</td>
                              <td className="py-2 text-muted-foreground">
                                {service.salonName || 'N/A'}
                              </td>
                              <td className="text-right py-2">{service.count}</td>
                              <td className="text-right py-2">LKR {(service.revenue || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              <div className="text-center text-xs text-muted-foreground mt-2 pdf-footer">
                <p>
                  © {new Date().getFullYear()} SalonBooking.lk | Generated on{" "}
                  {format(new Date(), "PP")}
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
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
                <div className="text-2xl font-bold">
                  {reportData?.stats.totalAppointments.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  For the selected period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Verified Salons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData?.stats.verified || reportData?.stats.activeSalons || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total: {reportData?.stats.totalSalons || 0} salons
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Lost Revenue (Cancelled Appointments)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  LKR {(reportData?.stats.lostRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Potential revenue from {reportData.appointmentsData?.cancelled || 0} cancelled appointments
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
                    Monthly revenue{" "}
                    {selectedSalon === "all"
                      ? "across all salons"
                      : "for selected salon"}
                  </CardDescription>
                </CardHeader>{" "}
                <CardContent>
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
                </CardHeader>{" "}
                <CardContent>
                  {Object.values(reportData?.appointmentsData || {}).some(
                    (val) => val > 0
                  ) ? (
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
                  <CardDescription>Top 8 most booked services with salon information</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData?.popularServices.length ? (
                    <div className="w-full h-[400px]">
                      <Line
                        data={popularServicesData}
                        options={lineChartOptions}
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-12 text-muted-foreground">
                      No service data available for the selected period
                    </div>
                  )}
                </CardContent>{" "}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
