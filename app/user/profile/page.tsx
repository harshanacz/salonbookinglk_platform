"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function UserProfile() {
  const { user } = useUser();
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    country: "",
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [profileImage, setProfileImage] = useState("/placeholder-user.jpg");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUserData({
            fullName: data.fullName || user?.fullName || "",
            email: data.email || user?.primaryEmailAddress?.emailAddress || "",
            mobileNumber: data.mobileNumber || "",
            gender: data.gender || "",
            country: data.country || "Sri Lanka",
          });

          if (data.profileImage) {
            setProfileImage(data.profileImage);
          } else if (user?.imageUrl) {
            setProfileImage(user.imageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleEditClick = (field: keyof typeof userData) => {
    setEditingField(field);
    setTempValue(userData[field]);
  };

  const handleSave = async () => {
    if (editingField) {
      // Update UI immediately
      setUserData((prevData) => ({
        ...prevData,
        [editingField]: tempValue,
      }));

      // Then save to API
      try {
        const response = await fetch("/api/user/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [editingField]: tempValue,
          }),
        });

        if (!response.ok) {
          console.error("Failed to save profile update");
        }
      } catch (error) {
        console.error("Error saving profile:", error);
      }

      setEditingField(null);
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64Image = reader.result as string;
          setProfileImage(base64Image);

          // Save the image to the database immediately
          try {
            const response = await fetch("/api/user/profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                profileImage: base64Image,
              }),
            });

            if (!response.ok) {
              console.error("Failed to save profile image");
            }
          } catch (error) {
            console.error("Error saving profile image:", error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-pink-50 p-6 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white">
              <AvatarImage src={profileImage} alt="Profile picture" />
              <AvatarFallback>{userData.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">{userData.fullName}</h2>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
            onClick={handleSave}
          >
            Save
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
              {editingField === "fullName" ? (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full"
                />
              ) : (
                <span>{userData.fullName}</span>
              )}
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Edit Full Name"
                onClick={() => handleEditClick("fullName")}
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
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="India">India</option>
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
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
