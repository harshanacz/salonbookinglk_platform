"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";

const staffFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  role: z.string().min(1, { message: "Please select a role." }),
  bio: z.string().optional(),
  availability: z.string().min(1, { message: "Please select availability." }),
  services: z.array(z.string()).min(1, { message: "Please select at least one service." }),
  workingDays: z.array(z.string()).min(1, { message: "Please select at least one working day." }),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

export default function EditStaffMember() {
  const [image, setImage] = useState<string | null>(null);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      bio: "",
      availability: "",
      services: [],
      workingDays: [],
    },
  });

  useEffect(() => {
    const fetchStaffMember = async () => {
      // Simulated data - replace with actual API call
      const mockData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        role: "senior-stylist",
        bio: "Experienced stylist with 10 years of experience",
        availability: "full-time",
        services: ["1", "2"],
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        image: "/path/to/image.jpg",
      };

      form.reset(mockData);
      setImage(mockData.image);
    };

    fetchStaffMember();
  }, [form, params]);

  function onSubmit(data: StaffFormValues) {
    console.log(data);
    toast({
      title: "Staff member updated",
      description: `${data.name}'s information has been updated.`,
    });
    router.push("/salon-owner/staff");
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvailabilityChange = (value: string) => {
    if (value === "full-time") {
      form.setValue("workingDays", ["monday", "tuesday", "wednesday", "thursday", "friday"]);
    } else if (value === "weekends-only") {
      form.setValue("workingDays", ["saturday", "sunday"]);
    } else {
      form.setValue("workingDays", []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/salon-owner/staff">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Staff Member</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Staff Information</CardTitle>
          <CardDescription>
            Update staff member information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-image">Profile Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {image ? (
                          <img
                            src={image}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a new profile picture (max 2MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Field */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role Field */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="senior-stylist">Senior Stylist</SelectItem>
                            <SelectItem value="junior-stylist">Junior Stylist</SelectItem>
                            <SelectItem value="nail-technician">Nail Technician</SelectItem>
                            <SelectItem value="beautician">Beautician</SelectItem>
                            <SelectItem value="massage-therapist">Massage Therapist</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  {/* Bio Field */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Availability Field */}
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleAvailabilityChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="weekends-only">Weekends Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Working Days Field */}
                  <FormField
                    control={form.control}
                    name="workingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Days</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                            <div key={day} className="flex items-center space-x-2">
                              <Checkbox
                                checked={field.value?.includes(day)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, day]
                                    : field.value.filter((d) => d !== day);
                                  field.onChange(newValue);
                                }}
                              />
                              <Label>{day.charAt(0).toUpperCase() + day.slice(1)}</Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href="/salon-owner/staff">Cancel</Link>
                </Button>
                <Button type="submit">Update Staff Member</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
