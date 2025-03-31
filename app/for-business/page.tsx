"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>
  ),
});

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "List your salon",
      "Basic appointment management",
      "Up to 5 services",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "Rs. 2,999/mo",
    description: "Best for growing salons",
    features: [
      "Everything in Basic",
      "Unlimited services",
      "Staff management",
      "Analytics dashboard",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large salon chains",
    features: [
      "Everything in Professional",
      "Multiple locations",
      "Custom branding",
      "API access",
      "Dedicated account manager",
    ],
  },
];

export default function BusinessSignup() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612 });

  const handleSubmit = () => {
    toast({
      title: "Registration submitted",
      description: "We'll review your application and get back to you soon.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-purple-900 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=400&width=1600"
            alt="Business background"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Grow Your Salon Business
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Join thousands of salons using our platform to reach more customers
            and manage their business efficiently.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose your plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative rounded-lg border p-6 ${
                        selectedPlan === plan.name
                          ? "border-primary ring-2 ring-primary ring-opacity-50"
                          : "border-gray-200"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-2xl font-bold">
                            {plan.price}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          {plan.description}
                        </p>
                      </div>
                      <ul className="mt-6 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full mt-6"
                        variant={
                          selectedPlan === plan.name ? "default" : "outline"
                        }
                        onClick={() => setSelectedPlan(plan.name)}
                      >
                        Select Plan
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setStep(2)} disabled={!selectedPlan}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        placeholder="Enter your salon name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business-type">Business Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salon">Hair Salon</SelectItem>
                          <SelectItem value="spa">Spa & Wellness</SelectItem>
                          <SelectItem value="barbershop">Barbershop</SelectItem>
                          <SelectItem value="nail-salon">Nail Salon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter business phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter business email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your business"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="h-[300px] rounded-lg overflow-hidden">
                      <Map
                        center={location}
                        zoom={15}
                        markers={[
                          {
                            id: 1,
                            position: location,
                            label: "Your Location",
                            selected: true,
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </label>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleSubmit}>Submit Application</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
