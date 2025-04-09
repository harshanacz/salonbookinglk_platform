"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BellIcon, MailIcon, PhoneIcon } from "lucide-react";

const NotificationsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Sample notifications data
  const recentNotifications = [
    {
      id: 1,
      title: "Appointment Reminder",
      message: "Your appointment with Salon XYZ is tomorrow at 2:00 PM",
      time: "2 hours ago",
      type: "appointment",
    },
    {
      id: 2,
      title: "Special Offer",
      message: "Get 20% off on all hair treatments this weekend!",
      time: "1 day ago",
      type: "promotion",
    },
    {
      id: 3,
      title: "Booking Confirmed",
      message: "Your booking has been confirmed for next Tuesday",
      time: "2 days ago",
      type: "booking",
    },
  ];

  return (
    <div className="p-6 md:p-10 bg-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button variant="outline" className="text-purple-700 border-purple-700">
          Mark all as read
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MailIcon className="h-5 w-5 text-purple-700" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="h-5 w-5 text-purple-700" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications in browser
                </p>
              </div>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 text-purple-700" />
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications via SMS
                </p>
              </div>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
        <div className="space-y-4">
          {recentNotifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 rounded-lg bg-white border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{notification.title}</h3>
                <span className="text-sm text-gray-500">{notification.time}</span>
              </div>
              <p className="text-gray-600">{notification.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default NotificationsPage; 