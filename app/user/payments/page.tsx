"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentAnalytics } from "@/components/user/payments/payment-analytics";

export default function PaymentsPage() {
  return (
    <div className="container w-full mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Payments</h1>
        <p className="text-muted-foreground">
          View your payment analytics and transaction history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Analytics</CardTitle>
          <CardDescription>
            View detailed analytics of your payments and spending trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentAnalytics />
        </CardContent>
      </Card>
    </div>
  );
}
