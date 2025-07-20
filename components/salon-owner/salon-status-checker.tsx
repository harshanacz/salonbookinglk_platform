"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface SalonStatusCheckerProps {
  children: React.ReactNode;
}

export default function SalonStatusChecker({ children }: SalonStatusCheckerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't check status for certain pages
    const excludePaths = [
      "/salon-owner/reactivate", 
      "/salon-owner/settings/deactivate-account",
      "/salon-owner/create-profile"
    ];
    
    if (excludePaths.some(path => pathname.includes(path))) {
      setIsLoading(false);
      return;
    }
    
    checkSalonStatus();
  }, [pathname]);

  const checkSalonStatus = async () => {
    try {
      const response = await fetch("/api/salon-owner/status");
      
      if (response.ok) {
        const data = await response.json();
        
        if (!data.isActive && pathname !== "/salon-owner/reactivate") {
          // Salon is deactivated, redirect to reactivation page
          router.push("/salon-owner/reactivate");
          return;
        }
        
        setIsActive(data.isActive);
      } else {
        // If API fails, don't redirect - user might not have a salon profile yet
        console.log("Salon status check failed:", response.status);
      }
    } catch (error) {
      console.error("Failed to check salon status:", error);
      // Don't redirect on API errors
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
