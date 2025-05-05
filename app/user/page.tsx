"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserPage() {
  const router = useRouter();
  
  // Redirect to the profile page
  useEffect(() => {
    router.push("/user/profile");
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-500">Redirecting to profile...</p>
    </div>
  );
}