"use client"; // Indicates that this file is a client-side component in Next.js

import type React from "react"; // Importing React types for type safety

import { useState } from "react"; // Importing useState hook for managing component state
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { useToast } from "@/components/ui/use-toast"; 
import { Facebook, Mail } from "lucide-react"; 
import Link from "next/link"; 
import Image from "next/image"; 

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false); // State to track loading status
  const { toast } = useToast(); // Destructure toast function from useToast hook

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true); // Set loading state to true
    // Simulate API call with a timeout
    setTimeout(() => {
      setIsLoading(false); // Reset loading state
      toast({
        title: "Welcome back!", // Toast title
        description: "You have successfully signed in.", // Toast description
      });
    }, 2000); // Simulate a 2-second delay
  };

  return (
    <div className="min-h-screen bg-gray-50 flex"> {/* Main container with full-screen height */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        {/* Left section for the sign-in form */}
        <div className="mx-auto w-full max-w-sm"> {/* Centered container for the form */}
          <div className="text-center"> {/* Header section */}
            <Link href="/" className="text-2xl font-bold text-primary">
              SalonBooking.lk {/* Brand name */}
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome back {/* Page title */}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Create one now {/* Link to sign-up page */}
              </Link>
            </p>
          </div>

          <div className="mt-8"> {/* Main content section */}
            <div className="space-y-4"> {/* Social login buttons */}
              <Button variant="outline" className="w-full">
                <Facebook className="mr-2 h-4 w-4" /> {/* Facebook icon */}
                Continue with Facebook {/* Button text */}
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" /> {/* Mail icon */}
                Continue with Google {/* Button text */}
              </Button>
              <div className="relative"> {/* Divider between social login and form */}
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" /> {/* Horizontal line */}
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    Or continue with {/* Divider text */}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6"> {/* Sign-in form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2"> {/* Email input field */}
                  <Label htmlFor="email">Email</Label> {/* Label for email */}
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2"> {/* Password input field */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label> {/* Label for password */}
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password? {/* Link to forgot password page */}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"} {/* Button text changes based on loading state */}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1"> {/* Right section for the image */}
        <Image
          src="/placeholder.svg?height=1000&width=1600" // Placeholder image
          alt="Sign in to SalonBooking.lk" 
          fill
          className="absolute inset-0 h-full w-full object-cover" // Styling for full coverage
        />
      </div>
    </div>
  );
}