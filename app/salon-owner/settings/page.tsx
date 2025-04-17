"use client";

// Import React hooks and components
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Main component for salon settings page
export default function SalonSettings() {
  // Initialize toast notification system
  const { toast } = useToast();
  
  // State for storing selected holiday dates
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // State for business hours configuration
  // Default hours for each day of the week
  const [businessHours, setBusinessHours] = useState({
    monday: { open: "09:00", close: "18:00", isOpen: true },
    tuesday: { open: "09:00", close: "18:00", isOpen: true },
    wednesday: { open: "09:00", close: "18:00", isOpen: true },
    thursday: { open: "09:00", close: "18:00", isOpen: true },
    friday: { open: "09:00", close: "18:00", isOpen: true },
    saturday: { open: "10:00", close: "16:00", isOpen: true },
    sunday: { open: "10:00", close: "14:00", isOpen: false },
  });

  // Handler for updating business hours
  // day: day of the week to update
  // field: either 'open' or 'close' time
  // value: new time value
  const handleBusinessHoursChange = (
    day: keyof typeof businessHours,
    field: "open" | "close",
    value: string
  ) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    });
  };

  // Toggles a day between open/closed status
  // day: day of the week to toggle
  const handleDayToggle = (day: keyof typeof businessHours) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        isOpen: !businessHours[day].isOpen,
      },
    });
  };

  // Handles date selection for holidays/special days
  // date: Date object to add/remove from selection
  const handleDateSelect = (date: Date) => {
    setSelectedDates((prev) => {
      // Check if date already exists in selection
      const dateExists = prev.some(
        (d) =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
      );

      // If date exists, remove it; otherwise add it
      if (dateExists) {
        return prev.filter(
          (d) =>
            !(
              d.getDate() === date.getDate() &&
              d.getMonth() === date.getMonth() &&
              d.getFullYear() === date.getFullYear()
            )
        );
      } else {
        return [...prev, date];
      }
    });
  };

  // Function to handle saving settings and show success toast notification
const saveSettings = () => {
  toast({
    title: "Settings saved",
    description: "Your salon settings have been updated successfully.",
  });
};

// Main component render
return (
  <div className="space-y-6">
    {/* Header section with title and save button */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 className="text-3xl font-bold">Salon Settings</h1>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Save changes button with icon */}
        <Button className="w-full sm:w-auto" onClick={saveSettings}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>

    {/* Settings tabs navigation */}
    <Tabs defaultValue="general">
      {/* Tab list for different settings sections */}
      <TabsList className="mb-6">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="business-hours">Business Hours</TabsTrigger>
        <TabsTrigger value="closed-days">Closed Days</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security-and-privacy">Security & Privacy</TabsTrigger>
        <TabsTrigger value="verify">Verify Saloon</TabsTrigger>
      </TabsList>

      {/* General settings tab content */}
      <TabsContent value="general" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Salon Information</CardTitle>
            <CardDescription>
              Update your salon's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Salon information form grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salon-name">Salon Name</Label>
                <Input id="salon-name" defaultValue="Salon Amaya" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-email">Email Address</Label>
                <Input
                  id="salon-email"
                  type="email"
                  defaultValue="contact@salonamaya.lk"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-phone">Phone Number</Label>
                <Input id="salon-phone" defaultValue="+94 77 123 4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-website">Website</Label>
                <Input
                  id="salon-website"
                  defaultValue="https://salonamaya.lk"
                />
              </div>
            </div>

            <Separator />

            {/* Address information section */}
            <div className="space-y-2">
              <Label htmlFor="salon-address">Address</Label>
              <Input id="salon-address" defaultValue="123 Galle Road" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salon-city">City</Label>
                <Input id="salon-city" defaultValue="Moratuwa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-province">Province</Label>
                <Input id="salon-province" defaultValue="Western" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon-postal-code">Postal Code</Label>
                <Input id="salon-postal-code" defaultValue="10400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Business hours settings tab content */}
      <TabsContent value="business-hours" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
            <CardDescription>
              Set your salon's regular operating hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Loop through each day's business hours */}
              {Object.entries(businessHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex items-center justify-between border-b pb-4"
                >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={hours.isOpen}
                        onCheckedChange={() =>
                          handleDayToggle(day as keyof typeof businessHours)
                        }
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    {hours.isOpen ? (
                      <div className="flex items-center gap-2">
                        <Select
                          value={hours.open}
                          onValueChange={(value) =>
                            handleBusinessHoursChange(
                              day as keyof typeof businessHours,
                              "open",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Opening time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 8).map(
                              (hour) => (
                                <SelectItem
                                  key={hour}
                                  value={`${hour
                                    .toString()
                                    .padStart(2, "0")}:00`}
                                >
                                  {hour === 12
                                    ? "12:00 PM"
                                    : hour < 12
                                    ? `${hour}:00 AM`
                                    : `${hour - 12}:00 PM`}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <span>to</span>
                        <Select
                          value={hours.close}
                          onValueChange={(value) =>
                            handleBusinessHoursChange(
                              day as keyof typeof businessHours,
                              "close",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Closing time" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 8).map(
                              (hour) => (
                                <SelectItem
                                  key={hour}
                                  value={`${hour
                                    .toString()
                                    .padStart(2, "0")}:00`}
                                >
                                  {hour === 12
                                    ? "12:00 PM"
                                    : hour < 12
                                    ? `${hour}:00 AM`
                                    : `${hour - 12}:00 PM`}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Closed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed-days" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Closed Days</CardTitle>
              <CardDescription>
                Mark days when your salon will be closed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Select Closed Days
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click on dates to mark them as closed. These days will not
                    be available for booking.
                  </p>
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Selected Closed Days
                  </h3>
                  {selectedDates.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDates.map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <span>{format(date, "MMMM d, yyyy")}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDateSelect(date)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border rounded-md">
                      <p className="text-gray-500">No closed days selected</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">New Booking Alerts</h3>
                    <p className="text-sm text-gray-500">
                      Get notified when a new booking is made
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">Booking Cancellation Alerts</h3>
                    <p className="text-sm text-gray-500">
                      Get notified when a booking is cancelled
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <h3 className="font-medium">
                      Service Approval Notifications
                    </h3>
                    <p className="text-sm text-gray-500">
                      Get notified when your service is approved or rejected
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-and-privacy" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Privacy & Security</CardTitle>
      <CardDescription>Manage your account security settings</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Change Password</h3>
          <p className="text-sm text-gray-500 mb-4">
            Update your password to keep your account secure.
          </p>
          <Link href ="/salon-owner/settings/change-password">
          <Button variant="default" size="lg" >Change Password</Button>
          </Link>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4 text-red-600">Deactivate Account</h3>
          <p className="text-sm text-gray-500 mb-4">
            Deactivating your account will disable your profile and remove access.
          </p>
          <Link href="/salon-owner/settings/deactivate-account">
          <Button variant="destructive" size="lg">Deactivate My Account</Button>
          </Link>
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
<TabsContent value="verify" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Verify Salon</CardTitle>
      <CardDescription>
        Complete the information to verify your salon.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="salon-name">Salon Name</Label>
          <Input id="salon-name" placeholder="Enter your salon name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salon-email">Email Address</Label>
          <Input id="salon-email" type="email" placeholder="Enter your email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salon-phone">Contact Number</Label>
          <Input id="salon-phone" placeholder="Enter your contact number" />
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="salon-documents">Upload Documents</Label>
        <p className="text-sm text-gray-500 mb-4">
          Upload relevant documents for verification (e.g., Business Registration).
        </p>
        <Input
          id="salon-documents"
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          className="border-2 border-gray-300 rounded-md p-2"
        />
      </div>
    </CardContent>
    <CardFooter>
      <Button
        variant="default"
        onClick={() => {
          // Logic for submitting the form data to admin
          alert("Salon verification data submitted to admin!");
        }}
      >
        Submit Verification
      </Button>
    </CardFooter>
  </Card>
</TabsContent>


      </Tabs>
    </div>
  );
}
