"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Form validation schema - removed role field
const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Username must be at least 2 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Username can only contain letters, numbers, '_' or '-'",
    }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

type FormValues = z.infer<typeof formSchema>;

export function AddAdminForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/super-admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        // Try to parse Clerk error
        let errorMsg =
          "There was an error creating the admin account. Please try again.";
        try {
          const errorData = await response.json();
          if (errorData?.errors?.[0]?.message) {
            errorMsg = errorData.errors[0].message;
          }
        } catch (e:any) {
          console.log(e.error);
        }
        console.log(errorMsg);
        toast({ 
          variant: "destructive",
          description: errorMsg 
        });
        return;
      }

      toast({ 
        title: "Success!",
        description: "Admin account has been created successfully.",
        variant: "default",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error creating the admin account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Username{' '}
                <span className="text-xs text-muted-foreground">
                  (letters, numbers, '_' or '-')
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. john_doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="john.doe@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password{' '}
                <span className="text-xs text-muted-foreground">
                  (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating Admin..." : "Create Admin"}
          </Button>
        </div>
      </form>
    </Form>
  );
}