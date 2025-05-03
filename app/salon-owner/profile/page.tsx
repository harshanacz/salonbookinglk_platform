"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, MapPin, Phone, Mail, Globe } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";

// Type definitions for user and salon data
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
  openingHours: string;
  businessRegistration: string;
}

export default function SalonOwnerProfile() {
  // State for user profile data
  const [userData, setUserData] = useState<UserData>({
    ownerName: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  // State for salon business data
  const [salonData, setSalonData] = useState<SalonData>({
    salonName: "",
    description: "",
    address: "",
    website: "",
    openingHours: "",
    businessRegistration: "",
  });

  // State for tracking which field is being edited
  const [editingField, setEditingField] = useState<
    keyof UserData | keyof SalonData | null
  >(null);

  // Temporary value storage during editing
  const [tempValue, setTempValue] = useState("");

  // Fetch user and salon data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile data
        const userRes = await fetch("/api/user");
        console.log("[USER_RES]", userRes);
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const user = await userRes.json();
        setUserData({
          ownerName: user.userName || "",
          email: user.email || "",
          phone: user.mobileNumber || "",
          profileImage: user.profileImage || "/images/salon/profile.jpg",
        });

        // Fetch salon business data
        const salonRes = await fetch("/api/salon-owner/salon-profile");
        if (!salonRes.ok) throw new Error("Failed to fetch salon context");
        const salon = await salonRes.json();
        setSalonData({
          salonName: salon.businessName || "",
          description: salon.businessCategory || "",
          address: salon.streetAddress || "",
          website: salon.website || "",
          openingHours:
            salon.workingHours && salon.workingHours.length
              ? `${salon.workingHours[0].start} - ${salon.workingHours[0].end}`
              : "",
          businessRegistration: salon.businessRegistrationNumber || "",
        });
      } catch (err) {
        console.error("[PROFILE_FETCH]", err);
      }
    };
    fetchData();
  }, []);

  // Handle edit button click
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

  // Save changes to backend API
  const handleSave = async () => {
    try {
      if (!editingField) return;
      
      // Update user data
      if (["ownerName", "email", "phone"].includes(editingField)) {
        const patch: Partial<UserData> & {
          userName?: string;
          mobileNumber?: string;
        } = {};
        if (editingField === "ownerName") patch.userName = tempValue;
        else if (editingField === "phone") patch.mobileNumber = tempValue;
        else patch[editingField as keyof UserData] = tempValue;
        
        const res = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Failed to update user");
        
        // Update local state
        setUserData((prev) => ({
          ...prev,
          [editingField as keyof UserData]: tempValue,
        }));
      } 
      // Update salon data
      else {
        const patch: Partial<SalonData> & {
          businessName?: string;
          businessCategory?: string;
          streetAddress?: string;
          businessRegistrationNumber?: string;
        } = {};
        if (editingField === "salonName") patch.businessName = tempValue;
        else if (editingField === "description")
          patch.businessCategory = tempValue;
        else if (editingField === "address") patch.streetAddress = tempValue;
        else if (editingField === "businessRegistration")
          patch.businessRegistrationNumber = tempValue;
        else patch[editingField as keyof SalonData] = tempValue;
        
        const res = await fetch("/api/salon-owner/salon-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error("Failed to update salon context");
        
        // Update local state
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

  // Handle profile image upload completion
  const handleImageUpload = async (res: any) => {
    if (!res || !res[0]?.url) return;
    const imageUrl = res[0].url;
    try {
      // Update profile image in database
      const patch = { profileImage: imageUrl };
      const resp = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!resp.ok) throw new Error("Failed to update profile image");
      
      // Update local state
      setUserData((prev) => ({ ...prev, profileImage: imageUrl }));
    } catch (err) {
      console.error("[PROFILE_IMAGE_UPLOAD]", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with title and save button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Salon Profile</h1>
        <Button
          onClick={handleSave}
          className="bg-[var(--primary2)] hover:bg-[var(--secondary2)] text-[var(--whiteColor)]"
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Image and Basic Info Card */}
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
              <p className="text-[var(--greyColor)]">{userData.ownerName}</p>
            </div>
          </div>
        </Card>

        {/* Contact and Business Information Card */}
        <Card className="p-6 md:col-span-2">
          <div className="space-y-6">
            {/* Business Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Business Information</h3>
              <div className="space-y-4">
                {/* Salon Name Field */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-[var(--greyColor)]">Salon Name</label>
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

                {/* Description Field */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-[var(--greyColor)]">Description</label>
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

                {/* Address Field */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--greyColor)]" />
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

                {/* Phone Field */}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[var(--greyColor)]" />
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

                {/* Email Field */}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--greyColor)]" />
                  {editingField === "email" ? (
                    <Input
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="flex-1"
                    />
                  ) : (
                    <span>{userData.email}</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick("email")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                {/* Website Field */}
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[var(--greyColor)]" />
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

                {/* Owner Name Field */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <label className="text-sm text-[var(--greyColor)]">Owner Name</label>
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

            {/* Business Hours Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Business Hours</h3>
              <div className="flex items-center gap-2">
                {editingField === "openingHours" ? (
                  <Input
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1"
                  />
                ) : (
                  <span>{salonData.openingHours}</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick("openingHours")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Legal Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Legal Information</h3>
              <div className="flex items-center gap-2">
                <span className="text-[var(--greyColor)]">Business Registration:</span>
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
