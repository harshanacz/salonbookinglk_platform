"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, MapPin, Phone, Mail, Globe, User, Building, Edit3 } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Add types for userData and salonData
interface UserData {
  ownerName: string;
  email: string;
  phone: string;
  profileImage: string;
}
interface SalonData {
  salonName: string;
  description: string;
  address: string;
  website: string;
  businessRegistration: string;
}

export default function SalonOwnerProfile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    ownerName: "",
    email: "",
    phone: "",
    profileImage: "",
  });
  const [salonData, setSalonData] = useState<SalonData>({
    salonName: "",
    description: "",
    address: "",
    website: "",
    businessRegistration: "",
  });
  const [editingField, setEditingField] = useState<
    "ownerName" | "salonName" | "description" | null
  >(null);
  const [tempValue, setTempValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string>("");

  // Geocoder to convert coordinates to address
  const geocodeLocation = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setFormattedAddress(address);
        return address;
      }
      return "";
    } catch (error) {
      console.error("Geocoding error:", error);
      return "";
    }
  }, []);

  // Fetch user and salon context data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First check if the profile is complete
        const profileCheckRes = await fetch("/api/salon-owner/profile-check");
        const profileCheckData = await profileCheckRes.json();

        if (!profileCheckData.isComplete) {
          // If profile is not complete, redirect to the create-profile page
          router.push("/salon-owner/create-profile");
          return;
        }

        const userRes = await fetch("/api/user");
        console.log("[USER_RES]", userRes);
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const user = await userRes.json();
        console.log("[USER_DATA]", user);

        const salonRes = await fetch("/api/salon-owner/salon-profile");
        console.log("[SALON_RES]", salonRes);
        if (!salonRes.ok) throw new Error("Failed to fetch salon context");
        const salon = await salonRes.json();
        console.log("[SALON_DATA]", salon);

        // Get formatted address if location exists
        let address = "";
        if (salon.location && salon.location.lat && salon.location.lng) {
          address = await geocodeLocation(
            salon.location.lat,
            salon.location.lng
          );
        }

        // Set user data
        setUserData({
          ownerName: salon.ownerName || user.userName || "",
          email: user.email || "",
          phone: salon.phoneNumber || user.mobileNumber || "",
          profileImage:
            salon.profilePictureUrl ||
            user.profileImage ||
            "/images/salon/profile.jpg",
        });

        // Set salon data with formatted address if available
        setSalonData({
          salonName: salon.businessName || "",
          description: salon.description || "",
          address:
            address ||
            (salon.location
              ? `${salon.location.lat}, ${salon.location.lng}`
              : ""),
          website: salon.website || "",
          businessRegistration: salon.businessRegistrationNumber || "",
        });
      } catch (err) {
        console.error("[PROFILE_FETCH]", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router, geocodeLocation]);

  // Handle edit click
  const handleEditClick = (field: "ownerName" | "salonName" | "description") => {
    setEditingField(field);
    if (field === "ownerName") {
      setTempValue(userData.ownerName);
    } else if (field === "salonName") {
      setTempValue(salonData.salonName);
    } else if (field === "description") {
      setTempValue(salonData.description);
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    try {
      if (!editingField) return;
      // Determine which table to update
      if (editingField === "ownerName") {
        const patch = { userName: tempValue };
        const res = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Failed to update user");
        setUserData((prev) => ({
          ...prev,
          ownerName: tempValue,
        }));
      } else {
        const patch: any = {};
        if (editingField === "salonName") patch.businessName = tempValue;
        else if (editingField === "description") patch.description = tempValue;
        
        const res = await fetch("/api/salon-owner/salon-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Failed to update salon context");
        setSalonData((prev) => ({
          ...prev,
          [editingField]: tempValue,
        }));
      }
      setEditingField(null);
    } catch (err) {
      console.error("[PROFILE_SAVE]", err);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (res: any) => {
    if (!res || !res[0]?.url) return;
    const imageUrl = res[0].url;
    try {
      // Update user profile image
      const userResp = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: imageUrl }),
      });
      if (!userResp.ok) throw new Error("Failed to update user profile image");

      // Update salon context profile picture URL
      const salonResp = await fetch("/api/salon-owner/salon-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePictureUrl: imageUrl }),
      });
      if (!salonResp.ok)
        throw new Error("Failed to update salon profile picture");

      setUserData((prev) => ({ ...prev, profileImage: imageUrl }));
    } catch (err) {
      console.error("[PROFILE_IMAGE_UPLOAD]", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.refresh()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Salon Profile
            </h1>
            <p className="text-gray-600 mt-2">Manage your salon information and settings</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={handleSave}
              disabled={!editingField}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image and Basic Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="w-28 h-28 border-3 border-gray-200 shadow-lg">
                    <AvatarImage src={userData.profileImage} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 text-2xl font-bold">
                      {salonData.salonName?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{salonData.salonName}</h2>
                  <p className="text-gray-600 flex items-center justify-center">
                    <User className="h-4 w-4 mr-2" />
                    {userData.ownerName}
                  </p>
                </div>
                
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={handleImageUpload}
                  onUploadError={(error: Error) => {
                    alert(`ERROR! ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-white border-2 border-purple-200 hover:border-purple-400 text-purple-700 hover:text-purple-800 font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm",
                    allowedContent: "text-gray-500 text-sm mt-2",
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Business Information */}
          <div className="lg:col-span-2">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Building className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">Business Information</h3>
                </div>
                <p className="text-gray-600 mt-1">Update your salon details and contact information</p>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Salon Name */}
                  <div className="group">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Salon Name
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick("salonName")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 rounded-lg hover:bg-purple-100 hover:text-purple-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingField === "salonName" ? (
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3 px-4 text-lg font-medium transition-all duration-200"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl py-3 px-4 border border-gray-200">
                        <p className="text-lg font-medium text-gray-800">{salonData.salonName}</p>
                      </div>
                    )}
                  </div>

                  {/* Owner Name */}
                  <div className="group">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Owner Name
                      </label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick("ownerName")}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 rounded-lg hover:bg-purple-100 hover:text-purple-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                    {editingField === "ownerName" ? (
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3 px-4 text-lg font-medium transition-all duration-200"
                      />
                    ) : (
                      <div className="bg-gray-50 rounded-xl py-3 px-4 border border-gray-200">
                        <p className="text-lg font-medium text-gray-800">{userData.ownerName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="group mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick("description")}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 rounded-lg hover:bg-purple-100 hover:text-purple-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  {editingField === "description" ? (
                    <Textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="border-2 border-purple-200 focus:border-purple-500 rounded-xl py-3 px-4 text-lg min-h-[120px] transition-all duration-200"
                      placeholder="Describe your salon..."
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-xl py-3 px-4 border border-gray-200 min-h-[120px]">
                      <p className="text-lg text-gray-800 leading-relaxed">{salonData.description}</p>
                    </div>
                  )}
                </div>

                {/* Contact Information Grid */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Address */}
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                          Address
                        </label>
                        <p className="text-gray-800 mt-1 leading-relaxed">{salonData.address}</p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                          Phone
                        </label>
                        <p className="text-gray-800 mt-1 font-medium">{userData.phone}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                          Email
                        </label>
                        <p className="text-gray-800 mt-1 font-medium">{userData.email}</p>
                      </div>
                    </div>

                    {/* Website */}
                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                          Website
                        </label>
                        <p className="text-gray-800 mt-1 font-medium">{salonData.website || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
