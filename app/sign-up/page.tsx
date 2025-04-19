"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Optimized image handling with Next.js

export default function SignUpPage() {
  const router = useRouter(); // Hook to enable navigation

  // Navigate to customer sign-up form
  const handleCustomerSignUp = () => {
    router.push("/sign-up/user");
  };

  // Navigate to salon owner sign-up form
  const handleSalonOwnerSignUp = () => {
    router.push("/sign-up/salon-owner");
  };

  return (
    // Main container with relative positioning for layered background
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      
      {/* Blurred background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/signup/signup-image.jpg"
          alt="Background"
          layout="fill" // Fill the entire container
          objectFit="cover" // Ensure image covers without distortion
          className="opacity-40 blur-sm" // Reduce visibility and apply blur
          priority // Load image with high priority
        />
      </div>

      {/* Optional dark overlay for better contrast against background */}
      <div className="absolute inset-0 bg-black bg-opacity-20 z-10" />

      {/* Foreground content: sign-up type selector card */}
      <div className="relative z-20 space-y-6 text-center bg-white bg-opacity-70 p-10 rounded-xl shadow-xl backdrop-blur-md">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900">
          Choose Your Sign-Up Type
        </h1>

        {/* Buttons to select between user types */}
        <div className="space-y-4">
          {/* Customer sign-up button */}
          <Button
            onClick={handleCustomerSignUp}
            className="w-full max-w-xs"
          >
            Sign Up as Customer
          </Button>

          {/* Salon Owner sign-up button */}
          <Button
            onClick={handleSalonOwnerSignUp}
            className="w-full max-w-xs"
          >
            Sign Up as Salon Owner
          </Button>
          
        </div>
      </div>
    </div>
  );
}
