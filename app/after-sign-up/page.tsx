"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function AfterSignUp() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get("type") || "CUSTOMER";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    userName: "",
    mobileNumber: "",
    gender: "Prefer not to say", // Make sure it exactly matches the enum value
    country: "Sri Lanka",
    address: "",
  });

  // Pre-fill name if available from Clerk
  useEffect(() => {
    if (isLoaded && user) {
      setFormData(prev => ({
        ...prev,
        userName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || prev.userName
      }));
    }
  }, [isLoaded, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!user?.primaryEmailAddress?.emailAddress) {
        throw new Error("Email address not available");
      }

      console.log("Submitting user data:", {
        type: userType,
        userName: formData.userName,
        email: user.primaryEmailAddress.emailAddress,
        mobileNumber: formData.mobileNumber,
        gender: formData.gender,
        country: formData.country,
        address: formData.address,
      });

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: userType,
          userName: formData.userName,
          email: user.primaryEmailAddress.emailAddress,
          mobileNumber: formData.mobileNumber,
          gender: formData.gender,
          country: formData.country,
          address: formData.address,
        }),
      });

      const data = await response.json();
      console.log("Response data:", data);

      // Check if we got data with an _id field (successful user creation)
      if (data._id) {
        // Success! Redirect based on user type
        if (userType === "SALON_OWNER") {
          router.push("/salon-owner/profile");
        } else {
          router.push("/user/profile");
        }
        return;
      }

      // If we didn't get a successful response
      if (data.errors && Array.isArray(data.errors)) {
        throw new Error(data.errors.join(", "));
      } else if (data.message) {
        throw new Error(data.message);
      } else {
        throw new Error("Unknown error occurred");
      }

    } catch (error) {
      console.error("Error saving user data:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-pageBackground flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pageBackground flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-primary">Complete Your Profile</h1>
        <p className="text-center text-gray-600 mb-6">
          Please provide your information to complete your registration
        </p>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country"
              name="country"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={formData.country}
              onChange={handleChange}
            >
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your address"
            ></textarea>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Saving..." : "Complete Registration"}
          </Button>
        </form>
      </div>
    </div>
  );
}
