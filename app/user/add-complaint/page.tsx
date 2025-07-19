"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function ComplaintForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [category, setCategory] = useState("payment-issue");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const apptId = searchParams.get("appointmentId");
    console.log("Appointment ID from URL:", apptId); // Debug log
    
    if (!apptId) {
      // Redirect to appointments page if no appointmentId provided
      router.push("/user/booking/user-appointments");
      return;
    }
    
    setAppointmentId(apptId);
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission - appointmentId:", appointmentId); // Debug log

    if (!appointmentId) {
      alert(
        "Appointment ID is required. Please access this form from a past appointment."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          category,
          subject,
          description,
        }),
      });

      if (response.ok) {
        alert("Complaint submitted successfully!");
        router.push("/user/complaints");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("An error occurred while submitting the complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3E5F5] p-6">
      <div className="max-w-md mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/user/booking/user-appointments")}
          className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointments
        </Button>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Add Complaint</CardTitle>
            {appointmentId ? (
              <p className="text-sm text-gray-600">
                Appointment ID: {appointmentId}
              </p>
            ) : (
              <p className="text-sm text-red-600">
                Loading appointment details...
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Complaint Category:</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment-issue">Payment issue</SelectItem>
                    <SelectItem value="delivery-issue">Delivery issue</SelectItem>
                    <SelectItem value="product-issue">Product issue</SelectItem>
                    <SelectItem value="service-issue">Service issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject:</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description:</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !appointmentId}
                className="w-full bg-purple-400 hover:bg-purple-500 text-black font-medium disabled:opacity-50"
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
