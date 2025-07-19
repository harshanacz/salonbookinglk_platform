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
import {
  CalendarIcon,
  Download,
} from "lucide-react";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface ReportData {
  totalRevenue: number;
  totalAppointments: number;
  newClients: number;
  customerSatisfaction: number;
  revenueChange: number;
  appointmentsChange: number;
  newClientsChange: number;
  popularServices: Array<{ service: string; count: number; revenue: number }>;
  dailyData?: Array<{ date: string; revenue: number; appointments: number }>;
}

// Chart color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

// Custom tooltip for currency formatting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-medium">{`Date: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey === 'revenue' ? 'Revenue: LKR ' + entry.value.toLocaleString() : 
               entry.dataKey === 'appointments' ? 'Appointments: ' + entry.value :
               entry.name + ': ' + entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [selectedService, setSelectedService] = useState<string>("all");
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalAppointments: 0,
    newClients: 0,
    customerSatisfaction: 4.8,
    revenueChange: 0,
    appointmentsChange: 0,
    newClientsChange: 0,
    popularServices: [],
    dailyData: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate mock daily data based on date range
  const generateDailyData = (revenue: number, appointments: number) => {
    if (!dateRange.from || !dateRange.to) return [];
    
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const avgDailyRevenue = revenue / days.length;
    const avgDailyAppointments = appointments / days.length;
    
    return days.map((day, index) => ({
      date: format(day, 'MMM dd'),
      revenue: Math.round(avgDailyRevenue * (0.7 + Math.random() * 0.6)), // Add some variation
      appointments: Math.round(avgDailyAppointments * (0.7 + Math.random() * 0.6)),
    }));
  };

  // Fetch report data from API
  const fetchReportData = async () => {
    if (!dateRange.from) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        from: dateRange.from.toISOString(),
        ...(dateRange.to && { to: dateRange.to.toISOString() }),
        ...(selectedService !== "all" && { service: selectedService }),
      });

      const response = await fetch(`/api/reports?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch reports');
      }
      
      const data = await response.json();
      
      // Generate daily data for charts
      const dailyData = generateDailyData(data.totalRevenue, data.totalAppointments);
      
      setReportData({
        ...data,
        dailyData
      });
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedService]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const exportReport = async () => {
    try {
      const params = new URLSearchParams({
        from: dateRange.from!.toISOString(),
        ...(dateRange.to && { to: dateRange.to.toISOString() }),
        ...(selectedService !== "all" && { service: selectedService }),
        format: 'csv'
      });

      const response = await fetch(`/api/reports/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salon-report-${format(dateRange.from!, 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button onClick={exportReport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-[300px] justify-start text-left font-normal"
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
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full sm:w-auto">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="HAIRCUT">Haircut</SelectItem>
              <SelectItem value="COLORING">Hair Coloring</SelectItem>
              <SelectItem value="NAILS">Manicure</SelectItem>
              <SelectItem value="MASSAGE">Massage</SelectItem>
              <SelectItem value="FACIAL">Facial</SelectItem>
              <SelectItem value="STYLING">Styling</SelectItem>
              <SelectItem value="SKIN_CARE">Skin Care</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchReportData}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
                <p className={`text-xs ${Math.abs(reportData.revenueChange) > 999 ? 'text-orange-600' : reportData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(reportData.revenueChange) > 999 ? 'Significant increase' : formatPercentage(reportData.revenueChange)} from last period
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
                <div className="text-2xl font-bold">{reportData.totalAppointments}</div>
                <p className={`text-xs ${Math.abs(reportData.appointmentsChange) > 999 ? 'text-orange-600' : reportData.appointmentsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(reportData.appointmentsChange) > 999 ? 'Significant increase' : formatPercentage(reportData.appointmentsChange)} from last period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">New Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.newClients}</div>
                <p className={`text-xs ${reportData.newClientsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.newClientsChange >= 0 ? '+' : ''}{reportData.newClientsChange} from last period
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
                <div className="text-2xl font-bold">{reportData.customerSatisfaction.toFixed(1)}/5</div>
                <p className="text-xs text-muted-foreground">Based on reviews</p>
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
                    Daily revenue trend over the selected period ({formatCurrency(reportData.totalRevenue)} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `LKR ${value.toLocaleString()}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#0088FE" 
                          strokeWidth={2}
                          dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#0088FE' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Statistics</CardTitle>
                  <CardDescription>
                    Daily appointments over the selected period ({reportData.totalAppointments} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="appointments" 
                          fill="#a250b3"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                  <CardDescription>
                    Distribution of services by booking count and revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Services List */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Service Performance</h4>
                      {reportData.popularServices.length > 0 ? (
                        reportData.popularServices.map((service, index) => (
                          <div key={`${service.service}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="capitalize font-medium">{service.service}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{service.count} bookings</div>
                              <div className="text-sm text-muted-foreground">
                                {formatCurrency(service.revenue)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No services found for the selected period
                        </p>
                      )}
                    </div>
                    
                    {/* Pie Chart */}
                    {reportData.popularServices.length > 0 && (
                      <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reportData.popularServices}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                              label={({ service, count, percent }) => 
                                `${service}: ${(percent * 100).toFixed(0)}%`
                              }
                              labelLine={false}
                            >
                              {reportData.popularServices.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name, props) => [
                                `${value} bookings (${formatCurrency(props.payload.revenue)})`,
                                'Count'
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}