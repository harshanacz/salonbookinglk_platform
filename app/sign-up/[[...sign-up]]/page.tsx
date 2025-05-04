"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

/**
 * Sign-up page component
 * Renders the Clerk authentication SignUp component with custom styling
 * and handles user role-based registration (customer or salon owner)
 */
export default function Page() {
  // Get URL query parameters to determine user role
  const searchParams = useSearchParams();
  
  // Extract role from URL or default to "customer"
  const role = searchParams.get("role") || "customer";
  
  // Convert role to appropriate user type for metadata
  const userType = role === "salon-owner" ? "SALON_OWNER" : "CUSTOMER";

  return (
    // Container with full-height centering
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* Clerk SignUp component with custom styling */}
      <SignUp
        appearance={{
          // Custom styling for Clerk elements
          elements: {
            // Style the primary button to match our design system
            formButtonPrimary: "bg-primary",
            // Style links to match our color scheme
            footerActionLink: "text-primary hover:text-primary-dark",
          },
        }}
        // Configuration for routing
        routing="path"
        path="/sign-up"
        // Sign-in redirect URL
        signInUrl="/sign-in"
        // Post-registration redirect with user type parameter
        forceRedirectUrl={`/after-sign-up?type=${userType}`}
        // Store user type in metadata for future reference
        unsafeMetadata={{
          type: userType,
        }}
      />
    </div>
  );
}
