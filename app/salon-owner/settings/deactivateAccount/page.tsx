import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const metadata: Metadata = {
  title: "Deactivate Account",
  description: "Deactivate your account",
}

export default function DeactivateAccountPage() {
  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Deactivate Account</CardTitle>
          <CardDescription>Please verify your identity to deactivate your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              After deactivating your account, you&apos;ll have a 30-day window to reactivate it by logging back in
              [^1]. Once this period ends, your account and all related information will be permanently deleted.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertDescription>
              You cannot deactivate your account if you have any ongoing bookings or active resources.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm deactivation</Label>
            <Input id="confirm" placeholder="Type 'DEACTIVATE' to confirm" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button variant="destructive" className="w-full">
            Deactivate Account
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/account">Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

