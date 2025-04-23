"use client";

import { SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "customer";

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
        afterSignUpUrl="/after-sign-up"
        unsafeMetadata={{
          type: role === "salon-owner" ? "SALON_OWNER" : "CUSTOMER",
        }}
      />
    </div>
  );
}
