"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, BarChart2, PlusCircle } from "lucide-react";
import { PaymentCards } from "@/components/user/payments/payment-cards";
import { PaymentAnalytics } from "@/components/user/payments/payment-analytics";
import { AddCard } from "@/components/user/payments/add-card";

export default function PaymentsPage() {
  return (
    <div className="container w-full mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Payments</h1>
        <p className="text-muted-foreground">
          Manage your payment methods and view payment analytics
        </p>
      </div>

      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment Cards</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="add-card" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add Card</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Cards</CardTitle>
              <CardDescription>
                View and manage your saved payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentCards />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Analytics</CardTitle>
              <CardDescription>
                View detailed analytics of your payments and spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-card" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Card</CardTitle>
              <CardDescription>
                Add a new payment method to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddCard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
