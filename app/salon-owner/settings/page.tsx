"use client";

// Import React hooks and components
import { useState, useEffect } from "react";
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
import { Save, Loader2, Upload, FileText, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UploadButton } from "@/lib/uploadthing";

// Interface for salon data
interface SalonData {
  businessName: string;
  description: string;
  website: string;
  phoneNumber: string;
  ownerName: string;
  location: {
    lat: number;
    lng: number;
  };
  businessHours: Array<{
    day: string;
    isOpen: boolean;
    open: string;
    close: string;
  }>;
  businessRegistrationNumber?: string; // This will store the document URL
}

// Interface for user data
interface UserData {
  email: string;
  userName: string;
}

// Day enum matching the backend Day enum
enum Day {
  MON = "MON",
  TUE = "TUE",
  WED = "WED",
  THU = "THU",
  FRI = "FRI",
  SAT = "SAT",
  SUN = "SUN",
}

// Business Hour interface
interface BusinessHour {
  day: Day;
  isOpen: boolean;
  open: string;
  close: string;
}

// Main component for salon settings page
export default function SalonSettings() {
  // Initialize toast notification system
  const { toast } = useToast();

  // State for storing selected holiday dates
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // State for salon data and user data
  const [salonData, setSalonData] = useState<SalonData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for document upload
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState<string | null>(null);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [formattedAddress, setFormattedAddress] = useState<string>("");

  // Generate all available time options for the time selectors (30 min intervals)
  const timeOptions = generateTimeOptions();

  // Geocoder to convert coordinates to address
  const geocodeLocation = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return "";
    } catch (error) {
      console.error("Geocoding error:", error);
      return "";
    }
  };

  // State for business hours configuration with default values
  const [businessHours, setBusinessHours] = useState({
    monday: { open: "09:00", close: "18:00", isOpen: true },
    tuesday: { open: "09:00", close: "18:00", isOpen: true },
    wednesday: { open: "09:00", close: "18:00", isOpen: true },
    thursday: { open: "09:00", close: "18:00", isOpen: true },
    friday: { open: "09:00", close: "18:00", isOpen: true },
    saturday: { open: "10:00", close: "16:00", isOpen: true },
    sunday: { open: "10:00", close: "14:00", isOpen: false },
  });

  const [activeTab, setActiveTab] = useState("general");

  // Function to generate time options for select dropdown
  function generateTimeOptions() {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  }

  // Helper function to convert backend day format to UI format
  const dayToUiFormat = (day: string): keyof typeof businessHours => {
    const dayMap: Record<string, keyof typeof businessHours> = {
      MON: "monday",
      TUE: "tuesday",
      WED: "wednesday",
      THU: "thursday",
      FRI: "friday",
      SAT: "saturday",
      SUN: "sunday",
    };
    return dayMap[day] || "monday";
  };

  // Helper function to convert UI day format to backend format
  const dayToApiFormat = (day: string): Day => {
    const dayMap: Record<string, Day> = {
      monday: Day.MON,
      tuesday: Day.TUE,
      wednesday: Day.WED,
      thursday: Day.THU,
      friday: Day.FRI,
      saturday: Day.SAT,
      sunday: Day.SUN,
    };
    return dayMap[day] || Day.MON;
  };

  // Format time for display
  const formatTimeForDisplay = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  // Fetch salon data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch salon profile data
        const salonResponse = await fetch("/api/salon-owner/salon-profile");
        if (!salonResponse.ok) {
          throw new Error("Failed to fetch salon data");
        }
        const salonDataResponse = await salonResponse.json();
        setSalonData(salonDataResponse);

        // Fetch user data to get email
        const userResponse = await fetch("/api/user");
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userDataResponse = await userResponse.json();
        setUserData(userDataResponse);

        // Update business hours from fetched data if available
        if (
          salonDataResponse.businessHours &&
          Array.isArray(salonDataResponse.businessHours)
        ) {
          const initialBusinessHours = { ...businessHours };

          // Map business hours from API to our state format
          salonDataResponse.businessHours.forEach((hour: BusinessHour) => {
            const dayKey = dayToUiFormat(hour.day);
            initialBusinessHours[dayKey] = {
              open: hour.open,
              close: hour.close,
              isOpen: hour.isOpen,
            };
          });

          setBusinessHours(initialBusinessHours);
        }

        // Set uploaded document URL if it exists
        if (salonDataResponse.businessRegistrationNumber) {
          setUploadedDocumentUrl(salonDataResponse.businessRegistrationNumber);
        }

        // Get formatted address if location exists
        if (salonDataResponse.location && salonDataResponse.location.lat && salonDataResponse.location.lng) {
          const address = await geocodeLocation(
            salonDataResponse.location.lat,
            salonDataResponse.location.lng
          );
          setFormattedAddress(address);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "There was a problem fetching your salon data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to handle query parameters
  useEffect(() => {
    // Check for tab query parameter
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      // If valid tab name, set it as default
      const validTabs = [
        "general",
        "business-hours",
        "closed-days",
        "notifications",
        "security-and-privacy",
        "verify",
      ];
      if (validTabs.includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Handler for updating business hours
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
  const saveSettings = async () => {
    try {
      setIsSaving(true);

      // Prepare businessHours data for API in the format the backend expects
      const businessHoursData = Object.entries(businessHours).map(
        ([day, hours]) => ({
          day: dayToApiFormat(day),
          isOpen: hours.isOpen,
          open: hours.open,
          close: hours.close,
        })
      );

      // Update salon settings
      const response = await fetch("/api/salon-owner/salon-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: (document.getElementById("salon-name") as HTMLInputElement)?.value,
          website: (document.getElementById("salon-website") as HTMLInputElement)?.value,
          phoneNumber: (document.getElementById("salon-phone") as HTMLInputElement)?.value,
          businessHours: businessHoursData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const updatedSalon = await response.json();

      // Update local state with the returned data
      setSalonData(updatedSalon);

      toast({
        title: "Settings saved",
        description: "Your salon settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description:
          "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save business hours separately
  const saveBusinessHours = async () => {
    try {
      setIsSaving(true);

      // Prepare businessHours data for API
      const businessHoursData = Object.entries(businessHours).map(
        ([day, hours]) => ({
          day: dayToApiFormat(day),
          isOpen: hours.isOpen,
          open: hours.open,
          close: hours.close,
        })
      );

      // Update only business hours
      const response = await fetch("/api/salon-owner/salon-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessHours: businessHoursData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save business hours");
      }

      toast({
        title: "Business hours updated",
        description: "Your salon's business hours have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving business hours:", error);
      toast({
        title: "Error saving business hours",
        description:
          "There was a problem updating your business hours. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle verification submission
  const submitVerification = async () => {
    try {
      setIsSubmittingVerification(true);

      if (!uploadedDocumentUrl) {
        toast({
          title: "Document required",
          description: "Please upload a verification document before submitting.",
          variant: "destructive",
        });
        return;
      }

      // Update salon profile with verification document
      const response = await fetch("/api/salon-owner/salon-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessRegistrationNumber: uploadedDocumentUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit verification");
      }

      toast({
        title: "Verification submitted",
        description: "Your salon verification has been submitted successfully. We'll review it soon.",
      });
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast({
        title: "Error submitting verification",
        description: "There was a problem submitting your verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="space-y-6">
      {/* Header section with title and save button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Salon Settings</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Save changes button with icon */}
          <Button
            className="w-full sm:w-auto"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Settings tabs navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tab list for different settings sections */}
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="business-hours">Business Hours</TabsTrigger>
          <TabsTrigger value="closed-days">Closed Days</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security-and-privacy">
            Security & Privacy
          </TabsTrigger>
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
                  <Input
                    id="salon-name"
                    defaultValue={salonData?.businessName || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-email">Email Address</Label>
                  <Input
                    id="salon-email"
                    type="email"
                    defaultValue={userData?.email || ""}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-phone">Phone Number</Label>
                  <Input
                    id="salon-phone"
                    defaultValue={salonData?.phoneNumber || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salon-website">Website</Label>
                  <Input
                    id="salon-website"
                    defaultValue={salonData?.website || ""}
                  />
                </div>
              </div>

              <Separator />

              {/* Address information section */}
              <div className="space-y-2">
                <Label htmlFor="salon-address">Address</Label>
                <Input
                  id="salon-address"
                  value={formattedAddress || (salonData?.location ? `Lat: ${salonData.location.lat}, Lng: ${salonData.location.lng}` : "")}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                />
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
                Set your salon's regular operating hours. These hours will be
                displayed to customers when they book.
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
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTimeForDisplay(time)}
                              </SelectItem>
                            ))}
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
                            {timeOptions.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTimeForDisplay(time)}
                              </SelectItem>
                            ))}
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
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                onClick={saveBusinessHours}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Business Hours
                  </>
                )}
              </Button>
            </CardFooter>
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
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Update your password to keep your account secure.
                  </p>
                  <Link href="/salon-owner/settings/change-password">
                    <Button variant="default" size="lg">
                      Change Password
                    </Button>
                  </Link>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4 text-red-600">
                    Deactivate Account
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Deactivating your account will disable your profile and
                    remove access.
                  </p>
                  <Link href="/salon-owner/settings/deactivate-account">
                    <Button variant="destructive" size="lg">
                      Deactivate My Account
                    </Button>
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
                Upload your business registration document to verify your salon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="verification-salon-name">Salon Name</Label>
                  <Input 
                    id="verification-salon-name" 
                    value={salonData?.businessName || ""} 
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verification-salon-email">Email Address</Label>
                  <Input
                    id="verification-salon-email"
                    type="email"
                    value={userData?.email || ""}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verification-salon-phone">Contact Number</Label>
                  <Input
                    id="verification-salon-phone"
                    value={salonData?.phoneNumber || ""}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verification-salon-owner">Owner Name</Label>
                  <Input
                    id="verification-salon-owner"
                    value={salonData?.ownerName || ""}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>Upload Verification Documents</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload your business registration certificate or other relevant documents for verification.
                    Accepted formats: PDF, JPG, PNG (Max: 8MB for PDF, 4MB for images)
                  </p>
                </div>

                {uploadedDocumentUrl ? (
                  <div className="border-2 border-green-200 rounded-md p-4 bg-green-50">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">Document uploaded successfully</p>
                        <p className="text-xs text-green-600 truncate">{uploadedDocumentUrl}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(uploadedDocumentUrl, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <UploadButton
                        endpoint="documentUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            setUploadedDocumentUrl(res[0].url);
                            toast({
                              title: "Document uploaded",
                              description: "Your verification document has been uploaded successfully.",
                            });
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast({
                            title: "Upload failed",
                            description: `Error: ${error.message}`,
                            variant: "destructive",
                          });
                        }}
                        appearance={{
                          button: "bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md",
                          allowedContent: "text-sm text-gray-500",
                        }}
                      />
                    </div>
                  </div>
                )}

                {uploadedDocumentUrl && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedDocumentUrl(null);
                        toast({
                          title: "Document removed",
                          description: "You can upload a new document.",
                        });
                      }}
                    >
                      Upload Different Document
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="default"
                onClick={submitVerification}
                disabled={!uploadedDocumentUrl || isSubmittingVerification}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmittingVerification ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Submit Verification
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
