"use client";

import { useState, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

/**
 * User Profile Page Component
 * Allows users to view and edit their personal information
 */
export default function UserProfile() {
  // Initial user data state
  const [userData, setUserData] = useState({
    fullName: "Naduni Siriwardhane",
    email: "Naduni123@gmail.com", // This is the primary email
    mobileNumber: "0712345678",
    gender: "Female",
    country: "Sri Lanka",
    emailUpdated: "1 month ago", // Last updated timestamp
    address: "No. 123,\nPeradeniya road,\nPiliyandala.",
  });

  // State for tracking which field is being edited
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Temporary value for the field being edited
  const [tempValue, setTempValue] = useState("");
  
  // State for profile image
  const [profileImage, setProfileImage] = useState("/placeholder-user.jpg");

  /**
   * Handles clicking the edit button for a field
   * @param field - The field to be edited
   */
  const handleEditClick = (field: keyof typeof userData) => {
    setEditingField(field);
    setTempValue(userData[field]);
  };

  /**
   * Saves the edited field value to the user data state
   */
  const handleSave = () => {
    if (editingField) {
      setUserData((prevData) => ({
        ...prevData,
        [editingField]: tempValue,
      }));
      setEditingField(null);
    }
  };

  /**
   * Handles profile image upload
   * @param e - Change event from the file input
   */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProfileImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pageBackground)] p-6">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header - User info and save button */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-[var(--whiteColor)]">
              <AvatarImage src={profileImage} alt="Profile picture" />
              <AvatarFallback>NS</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-medium">{userData.fullName}</h2>
              <p className="text-sm text-[var(--greyColor)]">{userData.email}</p>
            </div>
          </div>
          <Button
            className="bg-[var(--primary2)] hover:bg-[var(--secondary2)] text-[var(--whiteColor)] rounded-full px-6"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>

        {/* Profile Form - Grid layout for form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name Field */}
          <div>
            <label className="block text-sm text-[var(--greyColor)] mb-2">
              Full Name
            </label>
            <div className="flex items-center justify-between bg-[var(--backgroundWhite)] rounded-lg p-3 border border-[var(--lightGreyColor)]">
              {/* Conditional rendering based on edit state */}
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
                className="text-[var(--greyColor)] hover:text-[var(--textPrimary)]"
                aria-label="Edit Full Name"
                onClick={() => handleEditClick("fullName")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Number Field */}
          <div>
            <label className="block text-sm text-[var(--greyColor)] mb-2">
              Mobile number
            </label>
            <div className="flex items-center justify-between bg-[var(--backgroundWhite)] rounded-lg p-3 border border-[var(--lightGreyColor)]">
              {/* Conditional rendering based on edit state */}
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
                className="text-[var(--greyColor)] hover:text-[var(--textPrimary)]"
                aria-label="Edit Mobile Number"
                onClick={() => handleEditClick("mobileNumber")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Gender Field */}
          <div>
            <label className="block text-sm text-[var(--greyColor)] mb-2">Gender</label>
            <div className="flex items-center justify-between bg-[var(--backgroundWhite)] rounded-lg p-3 border border-[var(--lightGreyColor)]">
              {/* Conditional rendering based on edit state */}
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
                className="text-[var(--greyColor)] hover:text-[var(--textPrimary)]"
                aria-label="Edit Gender"
                onClick={() => handleEditClick("gender")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Country Field */}
          <div>
            <label className="block text-sm text-[var(--greyColor)] mb-2">Country</label>
            <div className="flex items-center justify-between bg-[var(--backgroundWhite)] rounded-lg p-3 border border-[var(--lightGreyColor)]">
              {/* Conditional rendering based on edit state */}
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
                className="text-[var(--greyColor)] hover:text-[var(--textPrimary)]"
                aria-label="Edit Country"
                onClick={() => handleEditClick("country")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Email Address Field (read-only) */}
          <div>
            <label className="block text-sm text-[var(--greyColor)] mb-2">
              My email Address
            </label>
            <div className="flex items-center gap-3 bg-[var(--backgroundWhite)] rounded-lg p-3 border border-[var(--lightGreyColor)]">
              <div className="w-5 h-5 bg-[var(--infoLight)] rounded-sm flex items-center justify-center text-[var(--info)]">
                @
              </div>
              <div>
                <div>{userData.email}</div>
                <div className="text-xs text-[var(--greyColor)]">
                  {userData.emailUpdated}
                </div>
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm text-[var(--greyColor)] mb-2">Address</label>
            <div className="flex items-center justify-between bg-[var(--backgroundWhite)] rounded-lg p-3 border border-[var(--lightGreyColor)]">
              {/* Conditional rendering based on edit state */}
              {editingField === "address" ? (
                <textarea
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full"
                />
              ) : (
                <span className="whitespace-pre-line">{userData.address}</span>
              )}
              <button
                className="text-[var(--greyColor)] hover:text-[var(--textPrimary)]"
                aria-label="Edit Address"
                onClick={() => handleEditClick("address")}
              >
                <Pencil size={18} />
              </button>
            </div>
          </div>

          {/* Profile Picture Upload Field */}
          <div>
            <label className="block text-sm text-[var(--greyColor)] mb-2">
              Profile Picture
            </label>
            <div className="flex items-center justify-between bg-[var(--backgroundWhite)] rounded-lg p-3 border border-[var(--lightGreyColor)]">
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
