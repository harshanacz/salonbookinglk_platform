"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AfterSignUpPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function createUser() {
      if (!user) return;

      try {
        // Get role from metadata or search params as fallback
        const metadataType = user.unsafeMetadata.type as string;
        const searchParamsType = searchParams.get("type");
        const type = metadataType || searchParamsType;

        // Create user in our database
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: type,
            userName: user.username || user.firstName,
            email: user.primaryEmailAddress?.emailAddress,
            mobileNumber: user.phoneNumbers[0]?.phoneNumber,
            profileImage: user.imageUrl,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create user");
        }

        // Add delay to ensure Clerk session is updated with new metadata
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Redirect to homepage with user type as search param
        window.location.href = `/?redirect_type=${type}`;
      } catch (error) {
        console.error("Error creating user:", error);
        // You might want to show an error message to the user here
      }
    }

    if (isLoaded && user) {
      createUser();
    }
  }, [isLoaded, user, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Setting up your account...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
