import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Metadata for the page, used by Next.js for SEO and browser tab info
export const metadata: Metadata = {
  title: "Deactivate Account",
  description: "Deactivate your account",
}

export default function DeactivateAccountPage() {
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
          {/* Destructive alert with deactivation warning */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              After deactivating your account, you&apos;ll have a 30-day window to reactivate it by logging back in
              [^1]. Once this period ends, your account and all related information will be permanently deleted.
            </AlertDescription>
          </Alert>

          {/* Secondary alert for additional deactivation restriction */}
          <Alert>
            <AlertDescription>
              You cannot deactivate your account if you have any ongoing bookings or active resources.
            </AlertDescription>
          </Alert>

          {/* Email input field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" required />
          </div>

          {/* Password input field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" required />
          </div>

          {/* Confirmation input to ensure user understands action */}
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm deactivation</Label>
            <Input id="confirm" placeholder="Type 'DEACTIVATE' to confirm" required />
          </div>
        </CardContent>

        {/* Footer with the deactivation button */}
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/">
            <Button variant="destructive" className="w-full">
              Deactivate Account
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
