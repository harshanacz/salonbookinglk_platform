"use client"

import { Clock, MapPin, MoreHorizontal, Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ServiceCard } from "@/components/service-card"

const services = [
    {
        id: 1,
        title: "Luxury Haircut & Styling",
        image: "#",
        price: 2500,
        salon: "Salon Amaya",
        rating: 4.8,
        reviews: 120,
        location: "Colombo",
      },
      {
        id: 2,
        title: "Relaxing Spa Treatment",
        image: "#",
        price: 5000,
        salon: "Salon Amaya",
        rating: 4.9,
        reviews: 85,
        location: "Kandy",
      },
]

const progressStats = [
  { label: "Profile rating", value: 100 },
  { label: "Order completion", value: 100 },
  { label: "Delivered on time", value: 100 },
]

export default function SalonProfile() {
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        
        {/* Salon Profile Section */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 bg-yellow-300 rounded-full flex items-center justify-center mb-3">
              <Image
                src="#"
                alt="Logo"
                width={80}
                height={80}
                className="opacity-80"
              />
            </div>
            <h1 className="text-2xl font-bold mt-2">Salon Amaya</h1>
            <div className="bg-yellow-500 text-white text-xs px-3 py-0.5 rounded-full mt-1">Best Seller</div>
            <div className="flex items-center mt-2">
              <div className="flex text-yellow-400">
                <svg xmlns="#" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-semibold ml-1">4.9</span>
              <span className="text-gray-500 text-sm ml-1">(440)</span>
            </div>
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-start">
              <Clock className="w-5 h-5 mt-0.5 text-gray-700" />
              <div className="ml-3">
                <div className="flex items-center">
                  <span>Open until 7:30PM</span>
                  <button className="ml-2 text-purple-600 text-sm">Edit</button>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="w-5 h-5 mt-0.5 text-gray-700" />
              <div className="ml-3">
                <div>Molpe Road, Moratuwa</div>
                <button className="text-purple-600 text-sm">Change Location</button>
              </div>
            </div>

            {/* Progress Stats */}
            <div className="mt-6 space-y-3">
              {progressStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{stat.label}</span>
                    <span>{stat.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-purple-600 rounded-full w-full"></div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4 text-purple-600 border-purple-600">
              Edit
            </Button>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">Active Services</h2>
              <div className="h-1 w-24 bg-purple-600 mt-1 rounded-full"></div>
            </div>
            <Button variant="outline" className="rounded-full h-12 w-12 p-0 border-2">
              <Plus className="h-6 w-6" />
              <span className="sr-only">Add New Service</span>
            </Button>
          </div>

          {/* Render Services Using ServiceCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500">Add New Service</span>
          </div>
        </div>
      </div>
    </div>
  )
}
