"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// Sample data for salons and clients
const salons = [
  { id: "1", name: "Glamour Salon", verified: true },
  { id: "2", name: "Beauty Hub", verified: false },
  { id: "3", name: "Style Studio", verified: true },
  { id: "4", name: "Hair Masters", verified: false },
  { id: "5", name: "Elegance Salon", verified: true },
]

const clients = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Emma Johnson" },
  { id: "3", name: "Michael Brown" },
  { id: "4", name: "Sophia Davis" },
  { id: "5", name: "James Wilson" },
]

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  sendNow: z.boolean().default(true),
  scheduledDateTime: z.date().optional(),
  allSalons: z.boolean().default(false),
  allClients: z.boolean().default(false),
  onlyVerifiedSalons: z.boolean().default(false), // New field for verified salons
  selectedSalons: z.array(z.string()).optional(),
  selectedClients: z.array(z.string()).optional(),
  recipientType: z.enum(["salons", "clients", "all"]).default("salons"), // Updated recipient type
})

export default function NotificationForm() {
  const [open, setOpen] = useState(false)
  const [openClients, setOpenClients] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      sendNow: true,
      allSalons: false,
      allClients: false,
      onlyVerifiedSalons: false, // Default value for verified salons
      selectedSalons: [],
      selectedClients: [],
      recipientType: "salons",
    },
  })

  const watchSendNow = form.watch("sendNow")
  const watchAllSalons = form.watch("allSalons")
  const watchAllClients = form.watch("allClients")
  const watchOnlyVerifiedSalons = form.watch("onlyVerifiedSalons") // Watch verified salons
  const watchRecipientType = form.watch("recipientType")

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate that at least one recipient is selected
    const hasSalonRecipients =
      values.recipientType === "salons" &&
      (values.allSalons || (values.selectedSalons && values.selectedSalons.length > 0))
    const hasClientRecipients =
      values.recipientType === "clients" &&
      (values.allClients || (values.selectedClients && values.selectedClients.length > 0))
    const hasAllRecipients = values.recipientType === "all"

    if (!hasSalonRecipients && !hasClientRecipients && !hasAllRecipients) {
      toast({
        title: "Validation Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Form submitted:", values)

      toast({
        title: "Notification Sent",
        description: "Your notification has been sent successfully.",
      })

      // Reset form
      form.reset({
        title: "",
        description: "",
        sendNow: true,
        allSalons: false,
        allClients: false,
        onlyVerifiedSalons: false,
        selectedSalons: [],
        selectedClients: [],
        recipientType: "salons",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error sending the notification.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter salons based on verification status
  const filteredSalons = watchOnlyVerifiedSalons
    ? salons.filter((salon) => salon.verified)
    : salons

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Send Notifications</CardTitle>
        <CardDescription>Create and send notifications to salons and clients</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Send Date and Time</h3>

                <FormField
                  control={form.control}
                  name="sendNow"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Send Just Now</FormLabel>
                        <FormDescription>Send the notification immediately</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {!watchSendNow && (
                  <FormField
                    control={form.control}
                    name="scheduledDateTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Schedule Date and Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outlineDate"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            <div className="p-3 border-t border-border">
                              <Select
                                onValueChange={(value) => {
                                  const date = field.value || new Date()
                                  const [hours, minutes] = value.split(":").map(Number)
                                  date.setHours(hours, minutes)
                                  field.onChange(date)
                                }}
                                defaultValue="12:00"
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }).map((_, hour) => (
                                    <>
                                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                        {`${hour.toString().padStart(2, "0")}:00`}
                                      </SelectItem>
                                      <SelectItem key={`${hour}:30`} value={`${hour}:30`}>
                                        {`${hour.toString().padStart(2, "0")}:30`}
                                      </SelectItem>
                                    </>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Recipients</h3>

                <FormField
                  control={form.control}
                  name="recipientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salons">Salons</SelectItem>
                          <SelectItem value="clients">Clients</SelectItem>
                          <SelectItem value="all">All Salons and Clients</SelectItem> {/* New option */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                                field.onChange(checked)
                                if (checked) {
                                  form.setValue("selectedSalons", [])
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>All Salons</FormLabel>
                            <FormDescription>Send to all registered salons</FormDescription>
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
                                    field.onChange(checked)
                                    form.setValue("selectedSalons", [])
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Only Verified Salons</FormLabel>
                                <FormDescription>Send to verified salons only</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {!watchOnlyVerifiedSalons && ( // Hide search bar if "Only Verified Salons" is selected
                          <FormField
                            control={form.control}
                            name="selectedSalons"
                            render={({ field }) => (
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
                                      >
                                        {(field.value?.length ?? 0) > 0
                                          ? `${field.value?.length ?? 0} salon${(field.value?.length ?? 0) > 1 ? "s" : ""} selected`
                                          : "Select salons..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0">
                                    <Command>
                                      <CommandInput placeholder="Search salons..." />
                                      <CommandList>
                                        <CommandEmpty>No salon found.</CommandEmpty>
                                        <CommandGroup>
                                          {filteredSalons.map((salon) => (
                                            <CommandItem
                                              key={salon.id}
                                              value={salon.id}
                                              onSelect={() => {
                                                const selectedValues = field.value || []
                                                const newValues = selectedValues.includes(salon.id)
                                                  ? selectedValues.filter((id) => id !== salon.id)
                                                  : [...selectedValues, salon.id]
                                                form.setValue("selectedSalons", newValues)
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  field.value?.includes(salon.id) ? "opacity-100" : "opacity-0",
                                                )}
                                              />
                                              {salon.name}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </>
                )}

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
                                field.onChange(checked)
                                if (checked) {
                                  form.setValue("selectedClients", [])
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>All Clients</FormLabel>
                            <FormDescription>Send to all registered clients</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {!watchAllClients && (
                      <FormField
                        control={form.control}
                        name="selectedClients"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Specific Clients</FormLabel>
                            <Popover open={openClients} onOpenChange={setOpenClients}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openClients}
                                    className="w-full justify-between"
                                  >
                                    {(field.value?.length ?? 0) > 0
                                      ? `${field.value?.length ?? 0} client${(field.value?.length ?? 0) > 1 ? "s" : ""} selected`
                                      : "Select clients..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search clients..." />
                                  <CommandList>
                                    <CommandEmpty>No client found.</CommandEmpty>
                                    <CommandGroup>
                                      {clients.map((client) => (
                                        <CommandItem
                                          key={client.id}
                                          value={client.id}
                                          onSelect={() => {
                                            const selectedValues = field.value || []
                                            const newValues = selectedValues.includes(client.id)
                                              ? selectedValues.filter((id) => id !== client.id)
                                              : [...selectedValues, client.id]
                                            form.setValue("selectedClients", newValues)
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value?.includes(client.id) ? "opacity-100" : "opacity-0",
                                            )}
                                          />
                                          {client.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
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
  )
}