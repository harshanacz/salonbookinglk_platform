"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface PaymentRecord {
  id: string;
  salon: string;
  service: string;
  amount: number;
  date: Date;
  status: 'Pending' | 'Completed' | 'Failed';
  method: string;
  appointmentId: string;
  createdAt: Date;
}

interface PaymentStats {
  totalSpent: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  pendingCount: number;
  spentChange: string;
  completedChange: string;
  failedChange: string;
}

interface PaymentData {
  payments: PaymentRecord[];
  stats: PaymentStats;
}

export const PaymentAnalytics = () => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await fetch('/api/user/payments');
        if (!response.ok) {
          throw new Error('Failed to fetch payment data');
        }
        const data = await response.json();
        if (data.success) {
          setPaymentData(data);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  // Process data for charts
  const getMonthlyData = () => {
    if (!paymentData?.payments) return [];
    
    const monthlyStats: Record<string, { completed: number, revenue: number }> = {};
    
    paymentData.payments
      .filter(payment => payment.status === 'Completed')
      .forEach(payment => {
        const date = new Date(payment.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { completed: 0, revenue: 0 };
        }
        
        monthlyStats[monthKey].completed += 1;
        monthlyStats[monthKey].revenue += payment.amount;
      });

    return Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month,
        completedBookings: stats.completed,
        revenue: stats.revenue,
      }))
      .slice(-6); // Last 6 months
  };

  const getRecentPaymentTrends = () => {
    if (!paymentData?.payments) return [];
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const dailyStats: Record<string, number> = {};
    
    paymentData.payments
      .filter(payment => new Date(payment.date) >= last7Days && payment.status === 'Completed')
      .forEach(payment => {
        const dateKey = new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyStats[dateKey] = (dailyStats[dateKey] || 0) + payment.amount;
      });

    return Object.entries(dailyStats)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading payment analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  const monthlyData = getMonthlyData();
  const recentTrends = getRecentPaymentTrends();
  const stats = paymentData?.stats;

  return (
    <div>
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="mt-4 grid grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">
                LKR {stats?.totalSpent?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.spentChange || '0%'} from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">Completed Payments</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.completedPayments || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.completedChange || '0%'} from last month
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">
                LKR {stats?.pendingPayments?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.pendingCount || 0} transactions pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg font-semibold">Failed Payments</p>
              <p className="text-2xl font-bold text-red-600">
                {stats?.failedPayments || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats?.failedChange || '0%'} from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`LKR ${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              View Details
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Payment Trends</h3>
            {recentTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={recentTrends}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`LKR ${Number(value).toLocaleString()}`, 'Amount']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No recent payments
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              View Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Records Table */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Salon</th>
                  <th className="text-left py-2">Service</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {paymentData?.payments.slice(0, 10).map((payment) => (
                  <tr key={payment.id} className="border-b">
                    <td className="py-2">{payment.salon}</td>
                    <td className="py-2 max-w-xs truncate">{payment.service}</td>
                    <td className="py-2">LKR {payment.amount.toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!paymentData?.payments || paymentData.payments.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No payment records found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 