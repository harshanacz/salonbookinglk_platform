"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"

export default function SalonBookingSignup() {
  const [tab, setTab] = useState("general")

  // Account Info
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState("")

  // Business Info
  const [businessName, setBusinessName] = useState("")
  const [website, setWebsite] = useState("")
  const [regNumber, setRegNumber] = useState("")
  const [category, setCategory] = useState("")

  // Contact Info
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("Sri Lanka")

  // Working Hours
  const [workingHours, setWorkingHours] = useState(
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => ({
      day,
      open: "",
      close: ""
    }))
  )

  // Working Days
  const [workingDays, setWorkingDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions.")
      return
    }
    setError("")
    setTab("business-details")
  }

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTab("contact-details")
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTab("working-hours")
  }

  const handleWorkingHoursSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTab("working-days")
  }

  const toggleWorkingDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const BackButton = ({ to }: { to: string }) => (
    <button
      type="button"
      onClick={() => setTab(to)}
      className="flex items-center text-sm text-gray-600 hover:text-black mb-4"
    >
      <ChevronLeft className="h-4 w-4 mr-1" /> Back
    </button>
  )

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="flex w-full">
        {/* Account Creation */}
        <TabsContent value="general" className="w-full p-8 bg-[#FFF5FF]">
          <div className="max-w-6xl mx-auto flex h-[600px]">
            <Card className="flex-1 rounded-r-none h-full">
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Start your salon journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 h-[calc(100%-120px)] flex flex-col">
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Confirm Password</Label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex space-x-2 pt-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(!!checked)}
                      />
                      <Label htmlFor="terms">
                        I agree to the <Link href="#" className="underline">terms</Link> and <Link href="#" className="underline">privacy policy</Link>.
                      </Label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-auto">Continue</Button>
                </form>
              </CardContent>
            </Card>
            <div className="flex-1 hidden md:block h-full">
              <div className="h-full bg-gray-100 rounded-lg rounded-l-none flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-lg font-medium mb-4">Image</p>
                    <p className="text-gray-500">(image)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Business Details */}
        <TabsContent value="business-details" className="w-full p-8 bg-[#FFF5FF]">
          <div className="max-w-xl mx-auto h-[600px]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 h-[calc(100%-120px)] flex flex-col">
                <BackButton to="general" />
                <form onSubmit={handleBusinessSubmit} className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div>
                      <Label>Business Name</Label>
                      <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Website (optional)</Label>
                      <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                    <div>
                      <Label>Business Registration Number (optional)</Label>
                      <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
                    </div>
                    <div>
                      <Label>Business Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hair Salon">Hair Salon</SelectItem>
                          <SelectItem value="Spa">Spa</SelectItem>
                          <SelectItem value="Nail Salon">Nail Salon</SelectItem>
                          <SelectItem value="Barber">Barber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-auto mb-4">Continue</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Details */}
        <TabsContent value="contact-details" className="w-full p-8 bg-[#FFF5FF]">
          <div className="max-w-xl mx-auto h-[600px]">
            <Card className="h-full">
              <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
              <CardContent className="space-y-4 h-[calc(100%-120px)] flex flex-col">
                <BackButton to="business-details" />
                <form onSubmit={handleContactSubmit} className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div>
                      <Label>Business Phone Number</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Street Address</Label>
                      <Input value={street} onChange={(e) => setStreet(e.target.value)} required />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                    </div>
                    <div>
                      <Label>Postal Code (optional)</Label>
                      <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4 mb-4">Continue</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Working Hours */}
        <TabsContent value="working-hours" className="w-full p-8 bg-[#FFF5FF]">
          <div className="max-w-3xl mx-auto h-[600px]">
            <Card className="h-full">
              <CardHeader><CardTitle>Working Hours</CardTitle></CardHeader>
              <CardContent className="space-y-4 h-[calc(100%-120px)] flex flex-col">
                <BackButton to="contact-details" />
                <form onSubmit={handleWorkingHoursSubmit} className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {workingHours.map((day, idx) => (
                      <div key={day.day} className="flex justify-between items-center space-x-4">
                        <Label className="w-1/6">{day.day}</Label>
                        <Input
                          type="time"
                          value={day.open}
                          onChange={(e) => {
                            const updated = [...workingHours]
                            updated[idx].open = e.target.value
                            setWorkingHours(updated)
                          }}
                        />
                        <Input
                          type="time"
                          value={day.close}
                          onChange={(e) => {
                            const updated = [...workingHours]
                            updated[idx].close = e.target.value
                            setWorkingHours(updated)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Button type="submit" className="w-full mt-4 mb-4">Continue</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Working Days */}
        <TabsContent value="working-days" className="w-full p-8 bg-[#FFF5FF]">
          <Card className="max-w-xl mx-auto">
            <CardHeader><CardTitle>Working Days</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <BackButton to="working-hours" />
              <div className="grid grid-cols-2 gap-4">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={workingDays.includes(day)}
                      onCheckedChange={() => toggleWorkingDay(day)}
                    />
                    <Label htmlFor={day}>{day}</Label>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">Finish</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  )
}
