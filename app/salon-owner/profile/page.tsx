"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, MapPin, Phone, Mail, Globe } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";

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
  openingHours: string;
  businessRegistration: string;
}

export default function SalonOwnerProfile() {
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
    openingHours: "",
    businessRegistration: "",
  });
  const [editingField, setEditingField] = useState<
    keyof UserData | keyof SalonData | null
  >(null);
  const [tempValue, setTempValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user and salon context data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
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

        // Set user data
        setUserData({
          ownerName: salon.ownerName || user.userName || "",
          email: user.email || "",
          phone: salon.phoneNumber || user.mobileNumber || "",
          profileImage: salon.profilePictureUrl || user.profileImage || "/images/salon/profile.jpg",
        });

        // Set salon data
        setSalonData({
          salonName: salon.businessName || "",
          description: salon.description || "",
          address: salon.location ? `${salon.location.lat}, ${salon.location.lng}` : "",
          website: salon.website || "",
          openingHours: salon.workingHours && salon.workingHours.length
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
      const patch = { profileImage: imageUrl };
      const resp = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!resp.ok) throw new Error("Failed to update profile image");
      setUserData((prev) => ({ ...prev, profileImage: imageUrl }));
    } catch (err) {
      console.error("[PROFILE_IMAGE_UPLOAD]", err);
    }
  };

  // Add test save function
  const handleTestSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/salon-owner/test-save", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to save test data");
      const salon = await res.json();
      console.log("[TEST_SAVE_RESPONSE]", salon);

      // Update salon data
      setSalonData({
        salonName: salon.businessName || "",
        description: salon.description || "",
        address: salon.location ? `${salon.location.lat}, ${salon.location.lng}` : "",
        website: salon.website || "",
        openingHours: salon.workingHours?.[0] 
          ? `${salon.workingHours[0].start} - ${salon.workingHours[0].end}`
          : "",
        businessRegistration: salon.businessRegistrationNumber || "",
      });

      // Update user data
      setUserData(prev => ({
        ...prev,
        ownerName: salon.ownerName || prev.ownerName,
        phone: salon.phoneNumber || prev.phone,
        profileImage: salon.profilePictureUrl || prev.profileImage,
      }));

      alert("Test data saved successfully!");
    } catch (err) {
      console.error("[TEST_SAVE]", err);
      alert("Failed to save test data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Salon Profile</h1>
        <div className="space-x-4">
          <Button
            onClick={handleTestSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? "Saving..." : "Test const value Save!"}
          </Button>
          <Button
            onClick={handleSave}
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
