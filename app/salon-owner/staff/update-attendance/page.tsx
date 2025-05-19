"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const attendanceSchema = z.object({
  date: z.string().min(1, "Please select a date."),
  timeSlot: z.string().min(1, "Please select a time duration."),
  status: z.string().min(1, "Please select a status"),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export default function UpdateAttendanceForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffId = searchParams.get("id");
  const [staffName, setStaffName] = useState("");

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      timeSlot: "All Day",
      status: "Active",
    },
  });

  useEffect(() => {
    const fetchStaffMember = async () => {
      if (!staffId) return;
      try {
        const response = await fetch(`/api/salon-owner/staff/${staffId}`);
        const data = await response.json();
        setStaffName(data.name);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch staff member details",
          variant: "destructive",
        });
      }
    };

    fetchStaffMember();
  }, [staffId]);

  const onSubmit = async (data: AttendanceFormValues) => {
    if (!staffId) return;

    try {
      const response = await fetch(
        `/api/salon-owner/staff/${staffId}/attendance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      toast({
        title: "Success",
        description: "Attendance status updated successfully",
      });

      router.push("/salon-owner/staff");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/salon-owner/staff">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Update Attendance</h1>
      </div>

      <div className="max-w-md mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Staff Member</h2>
              <p className="text-gray-600">{staffName}</p>
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="All Day">All Day</SelectItem>
                      <SelectItem value="Morning">Morning</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Update Attendance
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
