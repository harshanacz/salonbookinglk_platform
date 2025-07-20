"use client";

import { useState } from "react";
import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function DeactivateAccountPage() {
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Deactivate attempt:", { email, confirmation });
    
    if (!email || confirmation !== "DEACTIVATE") {
      toast({
        title: "Validation Error",
        description: "Please fill all fields correctly and type 'DEACTIVATE' to confirm",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending deactivation request...");
      
      const response = await fetch("/api/salon-owner/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          confirmation,
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to deactivate account");
      }

      toast({
        title: "Account Deactivated",
        description: data.message,
      });

      // Redirect to home page after successful deactivation
      setTimeout(() => {
        console.log("Redirecting to home page...");
        router.push("/");
      }, 2000);

    } catch (error: any) {
      console.error("Deactivation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md py-10">
      {/* Card container for form and content */}
      <Card>
        {/* Card header with title and description */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Deactivate Account</CardTitle>
          <CardDescription>Please verify your identity to deactivate your account</CardDescription>
        </CardHeader>

        {/* Card content section */}
        <CardContent className="space-y-4">
          <form onSubmit={handleDeactivate} className="space-y-4">
            {/* Destructive alert with deactivation warning */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                After deactivating your account, you&apos;ll have a 30-day window to reactivate it by logging back in.
                Once this period ends, your account and all related information will be permanently deleted.
              </AlertDescription>
            </Alert>

            {/* Secondary alert for additional deactivation restriction */}
            <Alert>
              <AlertDescription>
                cannot deactivate your account if you have any ongoing bookings or active resources.
              </AlertDescription>
            </Alert>

            {/* Email input field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email to confirm" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>

            {/* Confirmation input to ensure user understands action */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm deactivation</Label>
              <Input 
                id="confirm" 
                placeholder="Type 'DEACTIVATE' to confirm" 
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required 
                disabled={isLoading}
              />
            </div>
          </form>
        </CardContent>

        {/* Footer with the deactivation button */}
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleDeactivate}
            disabled={isLoading}
          >
            {isLoading ? "Deactivating..." : "Deactivate Account"}
          </Button>
          <Link href="/salon-owner/settings">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Toaster />
    </div>
  )
}
