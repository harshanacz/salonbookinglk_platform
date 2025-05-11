"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { Day } from "@/models/SalonContext";

interface CreateProfileFormData {
  businessName: string;
  description: string;
  address: string;
  website: string;
  phoneNumber: string;
  ownerName: string;
  businessRegistrationNumber: string;
}

export default function CreateSalonProfile() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateProfileFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if salon profile already exists and pre-fill form if it does
  useEffect(() => {
    async function checkExistingProfile() {
      try {
        setLoading(true);
        const response = await fetch("/api/salon-owner/salon-profile");
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if profile is already complete
          const profileCheckResponse = await fetch("/api/salon-owner/profile-check");
          const profileCheckData = await profileCheckResponse.json();
          
          if (profileCheckData.isComplete) {
            // If profile is complete, redirect to dashboard
            router.push("/salon-owner");
            return;
          }
          
          // Pre-fill form with existing data
          if (data) {
            setValue("businessName", data.businessName || "");
            setValue("description", data.description || "");
            setValue("address", data.location ? `${data.location.lat}, ${data.location.lng}` : "");
            setValue("website", data.website || "");
            setValue("phoneNumber", data.phoneNumber || "");
            setValue("ownerName", data.ownerName || "");
            setValue("businessRegistrationNumber", data.businessRegistrationNumber || "");
          }
        }
      } catch (err) {
        console.error("[PROFILE_CHECK]", err);
      } finally {
        setLoading(false);
      }
    }
    
    checkExistingProfile();
  }, [router, setValue]);

  const onSubmit = async (data: CreateProfileFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create a basic location (in a real app, you would use a map component)
      const location = { lat: 6.9271, lng: 79.8612 }; // Default to Colombo, Sri Lanka
      
      // Create default working hours (one week)
      const workingHours = [
        { day: "MON" as Day, isWorking: true, start: "09:00", end: "17:00" },
        { day: "TUE" as Day, isWorking: true, start: "09:00", end: "17:00" },
        { day: "WED" as Day, isWorking: true, start: "09:00", end: "17:00" },
        { day: "THU" as Day, isWorking: true, start: "09:00", end: "17:00" },
        { day: "FRI" as Day, isWorking: true, start: "09:00", end: "17:00" },
        { day: "SAT" as Day, isWorking: true, start: "09:00", end: "17:00" },
        { day: "SUN" as Day, isWorking: false, start: "00:00", end: "00:00" },
      ];
      
      // Create default business hours (same as working hours for now)
      const businessHours = [
        { day: "MON" as Day, isOpen: true, open: "09:00", close: "17:00" },
        { day: "TUE" as Day, isOpen: true, open: "09:00", close: "17:00" },
        { day: "WED" as Day, isOpen: true, open: "09:00", close: "17:00" },
        { day: "THU" as Day, isOpen: true, open: "09:00", close: "17:00" },
        { day: "FRI" as Day, isOpen: true, open: "09:00", close: "17:00" },
        { day: "SAT" as Day, isOpen: true, open: "09:00", close: "17:00" },
        { day: "SUN" as Day, isOpen: false, open: "00:00", close: "00:00" },
      ];

      // Check if profile exists (PUT) or is new (POST)
      const checkResponse = await fetch("/api/salon-owner/salon-profile");
      const method = checkResponse.ok ? "PATCH" : "POST";

      // Submit to API
      const response = await fetch("/api/salon-owner/salon-profile", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: data.businessName,
          description: data.description,
          location,
          website: data.website,
          phoneNumber: data.phoneNumber,
          ownerName: data.ownerName,
          businessRegistrationNumber: data.businessRegistrationNumber,
          workingHours,
          businessHours,
        }),
      });

      if (!response.ok) {
        // Handle both JSON and text responses
        let errorMessage = "Failed to create salon profile";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          const errorText = await response.text().catch(() => errorMessage);
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      // Redirect to salon profile page instead of dashboard
      router.push("/salon-owner/profile");
    } catch (err) {
      console.error("[PROFILE_CREATE]", err);
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-10 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Complete Your Salon Profile</h1>
      <p className="mb-6 text-orange-600">
        You need to complete your salon profile before accessing other salon owner features.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Enter the basic information about your salon business.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form fields remain unchanged */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input 
                id="businessName"
                placeholder="Enter your salon name"
                {...register("businessName", { required: "Business name is required" })}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500">{errors.businessName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description"
                placeholder="Describe your salon services"
                {...register("description", { required: "Description is required" })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input 
                  id="ownerName"
                  placeholder="Your name"
                  {...register("ownerName", { required: "Owner name is required" })}
                />
                {errors.ownerName && (
                  <p className="text-sm text-red-500">{errors.ownerName.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <Input 
                    id="phoneNumber"
                    placeholder="+94 XX XXX XXXX"
                    {...register("phoneNumber", { required: "Phone number is required" })}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-500" />
                  <Input 
                    id="website"
                    placeholder="https://yoursalon.com"
                    {...register("website")}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationNumber">Business Registration (Optional)</Label>
                <Input 
                  id="businessRegistrationNumber"
                  placeholder="Business registration number"
                  {...register("businessRegistrationNumber")}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <Input 
                  id="address"
                  placeholder="Full address"
                  {...register("address", { required: "Address is required" })}
                />
              </div>
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Note: You will be able to set your location precisely on the map after creating your profile.
              </p>
            </div>
          </CardContent>
          
          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Complete Salon Profile"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
