"use client";

import { useState, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, MapPin, Phone, Mail, Globe } from "lucide-react";

export default function SalonOwnerProfile() {
  const [salonData, setSalonData] = useState({
    salonName: "Glamour Studio",
    ownerName: "John Doe",
    email: "john@glamourstudio.com",
    phone: "+94 71 234 5678",
    address: "123 Beauty Lane, Colombo 07",
    description:
      "Premier salon offering a wide range of beauty and hair services. Specializing in modern cuts, coloring, and bridal packages.",
    website: "www.glamourstudio.com",
    openingHours: "9:00 AM - 8:00 PM",
    businessRegistration: "REG123456",
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [profileImage, setProfileImage] = useState("/images/salon/profile.jpg");

  const handleEditClick = (field: keyof typeof salonData) => {
    setEditingField(field);
    setTempValue(salonData[field]);
  };

  const handleSave = () => {
    if (editingField) {
      setSalonData((prevData) => ({
        ...prevData,
        [editingField]: tempValue,
      }));
      setEditingField(null);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Salon Profile</h1>
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Image and Basic Info */}
        <Card className="p-6 md:col-span-1">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={profileImage} />
              <AvatarFallback>GS</AvatarFallback>
            </Avatar>
            <label className="cursor-pointer">
              <Input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <span className="text-sm text-purple-600 hover:text-purple-700">
                Change Photo
              </span>
            </label>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{salonData.salonName}</h2>
              <p className="text-gray-500">{salonData.ownerName}</p>
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
                    <span>{salonData.phone}</span>
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
                    <span>{salonData.email}</span>
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
