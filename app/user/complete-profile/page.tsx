"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function CompleteProfile() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    mobileNumber: "",
    gender: "",
    country: "Sri Lanka",
  });

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.primaryEmailAddress?.emailAddress || ""
      }));
    }
  }, [user]);

  // Handle redirection state
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        // Try all possible navigation methods
        try {
          window.location.href = "/user/profile";
        } catch (error) {
          console.error("Failed to redirect with window.location", error);
          router.push("/user/profile");
        }
      }, 1000); // Small delay to ensure toast is visible
      
      return () => clearTimeout(timer);
    }
  }, [isRedirecting, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!profileData.fullName || !profileData.mobileNumber || !profileData.gender) {
      toast?.error("Please fill out all required fields");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Submitting profile data:", profileData);
      
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
        credentials: "include", // Include credentials in the request
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        toast?.success("Profile completed successfully");
        
        // Force a hard navigation
        window.location.href = "/user/profile";
      } else {
        console.error("Failed to save profile", data);
        toast?.error("Failed to complete profile: " + (data.error || "Unknown error"));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast?.error("An error occurred while saving your profile");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
        <p className="text-gray-500 mb-6 text-center">
          Please provide your details to complete your profile
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <Input
              name="mobileNumber"
              value={profileData.mobileNumber}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <Select
              value={profileData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <Select
              value={profileData.country}
              onValueChange={(value) => handleSelectChange("country", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="India">India</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
