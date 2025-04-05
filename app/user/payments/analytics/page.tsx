"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const bookingData = [
  { month: "Jan", value: 40 },
  { month: "Mar", value: 60 },
  { month: "May", value: 50 },
  { month: "Jul", value: 45 },
];

const paymentData = [
  { date: "April 18", value: 30 },
  { date: "April 20", value: 50 },
  { date: "April 22", value: 80 },
  { date: "April 25", value: 40 },
];

export default function AnalyticsPage() {
  return (
    <div className="bg-purple-50 min-h-screen p-10">
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <Card>
            <CardContent>
              <p className="text-lg font-semibold">Earnings to date</p>
              <p className="text-xl">LKR 15000.80</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-lg font-semibold">Average Selling Price</p>
              <p className="text-xl">LKR 2200</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6 bg-gray-100 p-4 rounded-lg h-40 flex items-center justify-center text-gray-500">
          Chart Placeholder
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-10">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Booking Overview</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={bookingData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="purple" />
              </BarChart>
            </ResponsiveContainer>
            <Button className="w-full mt-4">Details</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold">Payment Overview</h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={paymentData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="purple" />
              </BarChart>
            </ResponsiveContainer>
            <Button className="w-full mt-4">Details</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
