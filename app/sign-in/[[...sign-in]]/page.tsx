"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function Page() {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          elements: {
            formButtonPrimary: "bg-primary",
            footerActionLink: "text-primary hover:text-primary-dark",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        signUpForceRedirectUrl="/after-sign-up?type=CUSTOMER"
      />
    </div>
  );
}
