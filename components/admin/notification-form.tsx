"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface User {
  _id: string;
  userName: string | null;
  email: string;
  verified?: boolean;
  type: "SALON_OWNER" | "CUSTOMER";
}

interface FormValues {
  title: string;
  description: string;
  allSalons: boolean;
  allClients: boolean;
  onlyVerifiedSalons: boolean;
  selectedSalons?: string[];
  selectedClients?: string[];
  recipientType: "salons" | "clients" | "all";
}

export default function NotificationForm() {
  const [open, setOpen] = useState(false);
  const [openClients, setOpenClients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salons, setSalons] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [isLoadingSalons, setIsLoadingSalons] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      allSalons: false,
      allClients: false,
      onlyVerifiedSalons: false,
      selectedSalons: [],
      selectedClients: [],
      recipientType: "salons",
    },
    mode: "onChange",
  });

  // Fetch salons and clients from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch salons (SALON_OWNER)
        setIsLoadingSalons(true);
        const salonResponse = await fetch("/api/admin/users?type=SALON_OWNER&limit=100");
        if (salonResponse.ok) {
          const salonData = await salonResponse.json();
          setSalons(salonData.users || []);
        } else {
          console.error("Failed to fetch salons:", salonResponse.status);
          toast({
            title: "Error",
            description: "Failed to load salons",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching salons:", error);
        toast({
          title: "Error",
          description: "Failed to load salons",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSalons(false);
      }

      try {
        // Fetch clients (CUSTOMER)
        setIsLoadingClients(true);
        const clientResponse = await fetch("/api/admin/users?type=CUSTOMER&limit=100");
        if (clientResponse.ok) {
          const clientData = await clientResponse.json();
          setClients(clientData.users || []);
        } else {
          console.error("Failed to fetch clients:", clientResponse.status);
          toast({
            title: "Error",
            description: "Failed to load clients",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchUsers();
  }, []);

  const watchAllSalons = form.watch("allSalons");
  const watchAllClients = form.watch("allClients");
  const watchOnlyVerifiedSalons = form.watch("onlyVerifiedSalons");
  const watchRecipientType = form.watch("recipientType");

  const validateRecipients = (values: FormValues) => {
    const hasSalonRecipients =
      values.recipientType === "salons" &&
      (values.allSalons ||
        (values.selectedSalons && values.selectedSalons.length > 0));
    const hasClientRecipients =
      values.recipientType === "clients" &&
      (values.allClients ||
        (values.selectedClients && values.selectedClients.length > 0));
    const hasAllRecipients = values.recipientType === "all";

    return hasSalonRecipients || hasClientRecipients || hasAllRecipients;
  };

  const onSubmit = async (values: FormValues) => {
    if (!validateRecipients(values)) {
      toast({
        title: "Validation Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error sending notification");
      }

      const data = await response.json();

      // Log the admin activity
      try {
        // Determine the target based on recipient selection
        let target = "";
        let recipientCount = "";

        if (values.recipientType === "all") {
          target = "clients, salons";
          recipientCount = "all users";
        } else if (values.recipientType === "salons") {
          target = "salons";
          if (values.allSalons) {
            recipientCount = "all salons";
          } else if (values.onlyVerifiedSalons) {
            recipientCount = "verified salons";
          } else {
            recipientCount = `${values.selectedSalons?.length || 0} selected salons`;
          }
        } else if (values.recipientType === "clients") {
          target = "clients";
          if (values.allClients) {
            recipientCount = "all clients";
          } else {
            recipientCount = `${values.selectedClients?.length || 0} selected clients`;
          }
        }

        await fetch('/api/admin/log-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'NOTIFICATION_SEND',
            target: target,
            details: `Sent notification "${values.title}" to ${recipientCount}`,
            metadata: {
              notificationTitle: values.title,
              recipientType: values.recipientType,
              recipientCount: recipientCount,
              allSalons: values.allSalons,
              allClients: values.allClients,
              onlyVerifiedSalons: values.onlyVerifiedSalons,
              selectedSalonsCount: values.selectedSalons?.length || 0,
              selectedClientsCount: values.selectedClients?.length || 0
            }
          }),
        });
      } catch (error) {
        console.error('Failed to log admin activity:', error);
      }

      toast({
        title: "Notification Sent",
        description: "Your notification has been sent successfully.",
      });

      // Reset form
      form.reset({
        title: "",
        description: "",
        allSalons: false,
        allClients: false,
        onlyVerifiedSalons: false,
        selectedSalons: [],
        selectedClients: [],
        recipientType: "salons",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "There was an error sending the notification.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter salons based on verification status
  const filteredSalons = watchOnlyVerifiedSalons
    ? salons.filter((salon) => salon.verified)
    : salons;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Send Notifications</CardTitle>
        <CardDescription>
          Create and send notifications to salons and clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                rules={{ required: "Title is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Description is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[120px]" {...field} />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recipients</h3>

                <FormField
                  control={form.control}
                  name="recipientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salons">Salons</SelectItem>
                          <SelectItem value="clients">Clients</SelectItem>
                          <SelectItem value="all">
                            All Salons and Clients
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Salon Select */}
                {watchRecipientType === "salons" && (
                  <>
                    <FormField
                      control={form.control}
                      name="allSalons"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  form.setValue("selectedSalons", []);
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>All Salons</FormLabel>
                            <FormDescription>
                              Send to all registered salons
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {!watchAllSalons && (
                      <>
                        <FormField
                          control={form.control}
                          name="onlyVerifiedSalons"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    form.setValue("selectedSalons", []);
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Only Verified Salons</FormLabel>
                                <FormDescription>
                                  Send to verified salons only
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {!watchOnlyVerifiedSalons && (
                          <FormField
                            control={form.control}
                            name="selectedSalons"
                            rules={{
                              validate: (value) =>
                                watchRecipientType === "salons" &&
                                !watchAllSalons &&
                                !watchOnlyVerifiedSalons &&
                                (!value || value.length === 0)
                                  ? "Please select at least one salon"
                                  : true,
                            }}
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel>Select Specific Salons</FormLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outlineDate"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                        disabled={isLoadingSalons}
                                      >
                                        {isLoadingSalons
                                          ? "Loading salons..."
                                          : (field.value?.length ?? 0) > 0
                                          ? `${field.value?.length ?? 0} salon${
                                              (field.value?.length ?? 0) > 1
                                                ? "s"
                                                : ""
                                            } selected`
                                          : "Select salons..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Search salons..." />
                                      <CommandList>
                                        {isLoadingSalons && (
                                          <div className="py-6 text-center text-sm">
                                            Loading salons...
                                          </div>
                                        )}
                                        <CommandEmpty>
                                          No salon found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                          {filteredSalons.map((salon) => (
                                            <CommandItem
                                              key={salon._id}
                                              value={`${salon.userName || ""} ${salon.email}`}
                                              onSelect={() => {
                                                const selectedValues =
                                                  field.value || [];
                                                const isSelected = selectedValues.includes(
                                                  salon._id
                                                );
                                                const newValues = isSelected
                                                  ? selectedValues.filter(
                                                      (id) => id !== salon._id
                                                    )
                                                  : [...selectedValues, salon._id];
                                                form.setValue(
                                                  "selectedSalons",
                                                  newValues
                                                );
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value?.includes(
                                                    salon._id
                                                  )
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                              />
                                              <div className="flex flex-col">
                                                <span>
                                                  {salon.userName || "Unknown"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                  {salon.email}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                {fieldState.error && (
                                  <FormMessage>
                                    {fieldState.error.message}
                                  </FormMessage>
                                )}
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Clients select */}
                {watchRecipientType === "clients" && (
                  <>
                    <FormField
                      control={form.control}
                      name="allClients"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  form.setValue("selectedClients", []);
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>All Clients</FormLabel>
                            <FormDescription>
                              Send to all registered clients
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {!watchAllClients && (
                      <FormField
                        control={form.control}
                        name="selectedClients"
                        rules={{
                          validate: (value) =>
                            watchRecipientType === "clients" &&
                            !watchAllClients &&
                            (!value || value.length === 0)
                              ? "Please select at least one client"
                              : true,
                        }}
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Select Specific Clients</FormLabel>
                            <Popover
                              open={openClients}
                              onOpenChange={setOpenClients}
                            >
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openClients}
                                    className="w-full justify-between"
                                    disabled={isLoadingClients}
                                  >
                                    {isLoadingClients
                                      ? "Loading clients..."
                                      : (field.value?.length ?? 0) > 0
                                      ? `${field.value?.length ?? 0} client${
                                          (field.value?.length ?? 0) > 1
                                            ? "s"
                                            : ""
                                        } selected`
                                      : "Select clients..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search clients..." />
                                  <CommandList>
                                    {isLoadingClients && (
                                      <div className="py-6 text-center text-sm">
                                        Loading clients...
                                      </div>
                                    )}
                                    <CommandEmpty>
                                      No client found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {clients.map((client) => (
                                        <CommandItem
                                          key={client._id}
                                          value={`${client.userName || ""} ${client.email}`}
                                          onSelect={() => {
                                            const selectedValues =
                                              field.value || [];
                                            const isSelected = selectedValues.includes(
                                              client._id
                                            );
                                            const newValues = isSelected
                                              ? selectedValues.filter(
                                                  (id) => id !== client._id
                                                )
                                              : [...selectedValues, client._id];
                                            form.setValue(
                                              "selectedClients",
                                              newValues
                                            );
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value?.includes(client._id)
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col">
                                            <span>
                                              {client.userName || "Unknown"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {client.email}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            {fieldState.error && (
                              <FormMessage>
                                {fieldState.error.message}
                              </FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                {watchRecipientType === "all" && (
                  <div className="text-sm text-muted-foreground">
                    Notifications will be sent to all salons and clients.
                  </div>
                )}
              </div>
            </div>

            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Notification"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}