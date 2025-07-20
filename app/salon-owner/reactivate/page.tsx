"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function ReactivateAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [canReactivate, setCanReactivate] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check reactivation status when component mounts
    checkReactivationStatus();
  }, []);

  const checkReactivationStatus = async () => {
    try {
      const response = await fetch("/api/salon-owner/status");
      const data = await response.json();
      
      if (data.deactivatedAt) {
        const daysSinceDeactivation = (Date.now() - new Date(data.deactivatedAt).getTime()) / (1000 * 60 * 60 * 24);
        const remaining = Math.max(0, 30 - daysSinceDeactivation);
        
        setDaysRemaining(Math.ceil(remaining));
        setCanReactivate(remaining > 0);
      }
    } catch (error) {
      console.error("Failed to check reactivation status:", error);
    }
  };

  const handleReactivate = async () => {
    if (!canReactivate) {
      toast({
        title: "Cannot Reactivate",
        description: "Reactivation period has expired. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/salon-owner/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reactivate account");
      }

      toast({
        title: "Account Reactivated",
        description: data.message,
      });

      // Redirect to salon owner dashboard
      setTimeout(() => {
        router.push("/salon-owner");
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Reactivate Account</CardTitle>
          <CardDescription>
            Welcome back! Your account has been temporarily deactivated.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {canReactivate ? (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Good News!</AlertTitle>
                <AlertDescription>
                  You can still reactivate your account. 
                  {daysRemaining !== null && (
                    <> You have {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining to reactivate.</>
                  )}
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click the button below to reactivate your salon account and restore access to all features.
                </p>
                
                <Button 
                  onClick={handleReactivate}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Reactivating..." : "Reactivate My Account"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Reactivation Period Expired</AlertTitle>
                <AlertDescription>
                  Your 30-day reactivation period has expired. Your account and data have been permanently deleted.
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please contact our support team if you need assistance creating a new account.
                </p>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push("/sign-up?role=salon-owner")}
                  className="w-full"
                >
                  Create New Account
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  );
}
