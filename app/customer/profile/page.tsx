"use client"

import { useState, ChangeEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

export default function UserProfile() {
  const [userData, setUserData] = useState({
    fullName: "Naduni Siriwardhane",
    email: "Naduni123@gmail.com", // This is the primary email
    mobileNumber: "0778350764",
    gender: "Female",
    country: "Sri Lanka",
    emailUpdated: "1 month ago", // Last updated timestamp
    address: "No. 123,\nPeradeniya road,\nNedipala.",
  })

  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState("")
  const [profileImage, setProfileImage] = useState("/placeholder-user.jpg")

  const handleEditClick = (field: keyof typeof userData) => {
    setEditingField(field)
    setTempValue(userData[field])
  }

  const handleSave = () => {
    if (editingField) {
      setUserData((prevData) => ({
        ...prevData,
        [editingField]: tempValue,
      }))
      setEditingField(null)
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          setProfileImage(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white">
              <AvatarImage src={profileImage} alt="Profile picture" />
              <AvatarFallback>NS</AvatarFallback>
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
            <label className="block text-sm text-gray-600 mb-2">Full Name</label>
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
            <label className="block text-sm text-gray-600 mb-2">Mobile number</label>
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
                  <option value="Canada">India</option>
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
            <label className="block text-sm text-gray-600 mb-2">My email Address</label>
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <div className="w-5 h-5 bg-blue-100 rounded-sm flex items-center justify-center text-blue-500">@</div>
              <div>
                <div>{userData.email}</div> {/* Now using the same email as the top */}
                <div className="text-xs text-gray-400">{userData.emailUpdated}</div>
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
                  className="w-full"
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

          {/* Profile Picture */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Profile Picture</label>
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
  )
}