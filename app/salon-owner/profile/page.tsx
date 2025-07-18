"use client";

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, MapPin, Phone, Mail, Globe } from "lucide-react";
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
    keyof UserData | keyof SalonData | null
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
  const handleEditClick = (field: keyof UserData | keyof SalonData) => {
    setEditingField(field);
    if (field in salonData) {
      setTempValue(salonData[field as keyof SalonData] ?? "");
    } else if (field in userData) {
      setTempValue(userData[field as keyof UserData] ?? "");
    } else {
      setTempValue("");
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    try {
      if (!editingField) return;
      // Determine which table to update
      if (["ownerName", "phone"].includes(editingField)) {
        const patch: Partial<UserData> & {
          userName?: string;
          mobileNumber?: string;
        } = {};
        if (editingField === "ownerName") patch.userName = tempValue;
        else if (editingField === "phone") patch.mobileNumber = tempValue;
        const res = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Failed to update user");
        setUserData((prev) => ({
          ...prev,
          [editingField as keyof UserData]: tempValue,
        }));
      } else {
        const patch: Partial<SalonData> & {
          businessName?: string;
          businessCategory?: string;
          streetAddress?: string;
          businessRegistrationNumber?: string;
        } = {};
        if (editingField === "salonName") patch.businessName = tempValue;
        else if (editingField === "description")
          patch.businessCategory = tempValue;
        else if (editingField === "address") {
          // For address, we would ideally update the location in the database
          // but for now just update the display value
          patch.streetAddress = tempValue;
        } else if (editingField === "businessRegistration")
          patch.businessRegistrationNumber = tempValue;
        else patch[editingField as keyof SalonData] = tempValue;
        const res = await fetch("/api/salon-owner/salon-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Failed to update salon context");
        setSalonData((prev) => ({
          ...prev,
          [editingField as keyof SalonData]: tempValue,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Salon Profile</h1>
        <div>
          <Button
            onClick={handleSave}
            disabled={!editingField}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Image and Basic Info */}
        <Card className="p-6 md:col-span-1">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={userData.profileImage} />
              <AvatarFallback>SO</AvatarFallback>
            </Avatar>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={handleImageUpload}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
            <div className="text-center">
              <h2 className="text-xl font-semibold">{salonData.salonName}</h2>
              <p className="text-gray-500">{userData.ownerName}</p>
            </div>
          </div>
        </Card>

        {/* Contact and Business Information */}
        <Card className="p-6 md:col-span-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Business Information</h3>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Salon Name</label>
                    {editingField === "salonName" ? (
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="max-w-sm"
                      />
                    ) : (
                      <p>{salonData.salonName}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick("salonName")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Description</label>
                    {editingField === "description" ? (
                      <Textarea
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="max-w-sm"
                      />
                    ) : (
                      <p className="max-w-sm">{salonData.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick("description")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  {editingField === "address" ? (
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <span>{salonData.address}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick("address")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {editingField === "phone" ? (
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <span>{userData.phone}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick("phone")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{userData.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  {editingField === "website" ? (
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <span>{salonData.website}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick("website")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-500">Owner Name</label>
                    {editingField === "ownerName" ? (
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="max-w-sm"
                      />
                    ) : (
                      <p>{userData.ownerName}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick("ownerName")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Legal Information</h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Business Registration:</span>
                {editingField === "businessRegistration" ? (
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1"
                  />
                ) : (
                  <span>{salonData.businessRegistration}</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick("businessRegistration")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
