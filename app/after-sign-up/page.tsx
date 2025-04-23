"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AfterSignUpPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function createUser() {
      if (!user) return;

      try {
        // Get role from metadata
        const type = user.unsafeMetadata.type as string;

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

        // Redirect based on role
        router.push(
          type === "SALON_OWNER" ? "/salon-owner/profile" : "/user/profile"
        );
      } catch (error) {
        console.error("Error creating user:", error);
        // You might want to show an error message to the user here
      }
    }

    if (isLoaded && user) {
      createUser();
    }
  }, [isLoaded, user, router]);

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
