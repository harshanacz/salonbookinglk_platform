"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Clock, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

// Sample staff members for assignment
const staffMembers = [
  { id: "1", name: "Dhanuka Perera", role: "Senior Stylist" },
  { id: "2", name: "Samantha Silva", role: "Nail Technician" },
  { id: "3", name: "Priyanka Jayawardena", role: "Beautician" },
  { id: "4", name: "Nimal Fernando", role: "Junior Stylist" },
  { id: "5", name: "Kumari Perera", role: "Massage Therapist" },
];

const serviceFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  price: z.string().min(1, { message: "Please enter a price." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  instructions: z.string().optional(),
  slotDuration: z
    .string()
    .min(1, { message: "Please select a slot duration." }),
  staffMembers: z
    .array(z.string())
    .min(1, { message: "Please select at least one staff member." }),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function CreateService() {
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      category: "",
      price: "",
      description: "",
      instructions: "",
      slotDuration: "30",
      staffMembers: [],
    },
  });

  function onSubmit(data: ServiceFormValues) {
    console.log(data);
    toast({
      title: "Service created",
      description: "Your service has been submitted for approval.",
    });
    // In a real app, you would submit this data to your backend
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setImages((prev) => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/salon-owner/services">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Service</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>Create a new service for your salon</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter service title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hair-cuts">Hair Cuts</SelectItem>
                            <SelectItem value="hair-coloring">
                              Hair Coloring
                            </SelectItem>
                            <SelectItem value="nail-arts">Nail Arts</SelectItem>
                            <SelectItem value="skin-care">Skin Care</SelectItem>
                            <SelectItem value="brows-lashes">
                              Brows & Lashes
                            </SelectItem>
                            <SelectItem value="makeup">Makeup</SelectItem>
                            <SelectItem value="massage">Massage</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (LKR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter price"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="service-images">Service Images</Label>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 rounded-md overflow-hidden border"
                        >
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Service preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center">
                        <label
                          htmlFor="service-images"
                          className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                        >
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">
                            Add Image
                          </span>
                          <Input
                            id="service-images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload up to 5 images of your service (max 2MB each)
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a description of the service"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any instructions for clients (optional)"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide any preparation instructions or information
                          clients should know before the service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                <h3 className="text-lg font-medium">Scheduling Settings</h3>

                <FormField
                  control={form.control}
                  name="slotDuration"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Slot Duration</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="30" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                30 minutes
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="60" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />1 hour
                              </div>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="120" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />2 hours
                              </div>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        This determines how long each appointment slot will be
                        for this service
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-6">
                <h3 className="text-lg font-medium">Staff Assignment</h3>
                <FormField
                  control={form.control}
                  name="staffMembers"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Assign Staff Members</FormLabel>
                        <FormDescription>
                          Select which staff members can perform this service
                        </FormDescription>
                      </div>
                      <div className="space-y-2">
                        {staffMembers.map((staff) => (
                          <FormField
                            key={staff.id}
                            control={form.control}
                            name="staffMembers"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={staff.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(staff.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              staff.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== staff.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-base">
                                      {staff.name}
                                    </FormLabel>
                                    <FormDescription>
                                      {staff.role}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href="/salon-owner/services">Cancel</Link>
                </Button>
                <Button type="submit">Create Service</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
