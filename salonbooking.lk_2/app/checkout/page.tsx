"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, Wallet } from "lucide-react";
import Image from "next/image";

// Sample checkout data (in a real app, this would come from your global state or API)
const checkoutData = {
  services: [
    {
      id: 1,
      name: "Custom Hair Coloring And Highlights",
      price: 620,
      image: "/placeholder.svg?height=100&width=100",
    },
  ],
  salon: {
    name: "Salon Amandi",
    location: "Katubedda, Galle Road",
  },
  date: "May 15, 2024",
  time: "10:00 AM",
};

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { toast } = useToast();

  const handlePayment = () => {
    toast({
      title: "Booking Confirmed",
      description: "Your appointment has been successfully booked.",
    });
    // In a real app, you would process the payment and create the booking here
  };

  const subtotal = checkoutData.services.reduce(
    (sum, service) => sum + service.price,
    0
  );
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                {checkoutData.services.map((service) => (
                  <div key={service.id} className="flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-4">
                      <Image
                        src={service.image || "/placeholder.svg"}
                        alt={service.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <div className="text-sm text-gray-500">
                        Rs. {service.price}
                      </div>
                    </div>
                  </div>
                ))}
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Salon</span>
                    <span>{checkoutData.salon.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span>{checkoutData.salon.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>{checkoutData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span>{checkoutData.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Digital Wallet
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "wallet" && (
                  <div className="mt-4">
                    <p>
                      You will be redirected to the digital wallet payment page.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Rs. {tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full mt-6" onClick={handlePayment}>
                  Pay Now
                </Button>

                <p className="text-sm text-gray-500 mt-4">
                  By clicking "Pay Now", you agree to our Terms of Service and
                  Privacy Policy.
                </p>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>You Might Also Like</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add recommended services here */}
                <p className="text-sm text-gray-500">
                  Recommended services from the same salon will be displayed
                  here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
