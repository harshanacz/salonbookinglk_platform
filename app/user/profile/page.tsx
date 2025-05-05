"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserData {
  userName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  country: string;
  address: string;
  profileImage: string;
  updatedAt: string;
}

export default function UserProfile() {
  const [userData, setUserData] = useState<UserData>({
    userName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    country: "",
    address: "",
    profileImage: "/placeholder-user.jpg",
    updatedAt: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData({
          userName: data.userName || "",
          email: data.email || "",
          mobileNumber: data.mobileNumber || "",
          gender: data.gender || "Prefer not to say",
          country: data.country || "Sri Lanka",
          address: data.address || "",
          profileImage: data.profileImage || "/placeholder-user.jpg",
          updatedAt: new Date(data.updatedAt).toLocaleDateString(),
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = (field: keyof UserData) => {
    setEditingField(field);
    setTempValue(userData[field]);
  };

  const handleSave = async () => {
    if (editingField) {
      setIsSaving(true);
      try {
        const response = await fetch("/api/user", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [editingField]: tempValue,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update user data");
        }

        setUserData((prevData) => ({
          ...prevData,
          [editingField]: tempValue,
          updatedAt: new Date().toLocaleDateString(),
        }));
        setEditingField(null);
      } catch (error) {
        console.error("Error updating user data:", error);
        alert("Failed to update. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);

      // Simulate an upload with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a temporary URL for preview
      const imageUrl = URL.createObjectURL(file);

      // Update the user profile with the new image URL
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileImage: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile image");
      }

      setUserData((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pink-50 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white">
              <AvatarImage src={userData.profileImage} alt="Profile picture" />
              <AvatarFallback>{userData.userName.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">{userData.userName}</h2>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
            onClick={handleSave}
            disabled={!editingField || isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Full Name
            </label>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              {editingField === "userName" ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full outline-none"
                />
              ) : (
                <span>{userData.userName}</span>
              )}
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit Full Name"
                onClick={() => handleEditClick("userName")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Mobile number
            </label>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              {editingField === "mobileNumber" ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full outline-none"
                />
              ) : (
                <span>{userData.mobileNumber}</span>
              )}
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit Mobile Number"
                onClick={() => handleEditClick("mobileNumber")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Gender</label>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              {editingField === "gender" ? (
                <select
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full outline-none bg-transparent"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <span>{userData.gender}</span>
              )}
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit Gender"
                onClick={() => handleEditClick("gender")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Country</label>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              {editingField === "country" ? (
                <select
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full outline-none bg-transparent"
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                </select>
              ) : (
                <span>{userData.country}</span>
              )}
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit Country"
                onClick={() => handleEditClick("country")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* My email Address */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              My email Address
            </label>
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <div className="w-5 h-5 bg-blue-100 rounded-sm flex items-center justify-center text-blue-500">
                @
              </div>
              <div>
                <div>{userData.email}</div>
                <div className="text-xs text-gray-400">
                  Last updated: {userData.updatedAt}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Address</label>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              {editingField === "address" ? (
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full outline-none"
                  rows={3}
                />
              ) : (
                <span className="whitespace-pre-line">{userData.address}</span>
              )}
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit Address"
                onClick={() => handleEditClick("address")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Profile Picture - Simple file input instead of UploadButton */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Profile Picture
            </label>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <label className="flex items-center justify-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-50 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {uploadingImage ? "Uploading..." : "Upload new image"}
                </span>
                <Input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
