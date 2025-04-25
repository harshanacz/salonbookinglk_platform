"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "customer";
  const userType = role === "salon-owner" ? "SALON_OWNER" : "CUSTOMER";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary",
            footerActionLink: "text-primary hover:text-primary-dark",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl={`/after-sign-up?type=${userType}`}
        unsafeMetadata={{
          type: userType,
        }}
      />
    </div>
  );
}
