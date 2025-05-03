"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

/**
 * Sign-in page component
 * Renders the Clerk authentication SignIn component with custom styling
 * and handles theme-based appearance
 */
export default function Page() {
  // Get current theme from next-themes
  const { theme } = useTheme();

  return (
    // Container with full-height centering
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* Clerk SignIn component with custom styling */}
      <SignIn
        appearance={{
          // Set base theme based on current theme selection
          baseTheme: theme === "dark" ? dark : undefined,
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
        path="/sign-in"
        // Redirect URLs
        signUpUrl="/sign-up"
        signUpForceRedirectUrl="/after-sign-up?type=CUSTOMER"
      />
    </div>
  );
}
