"use client";;
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface ServiceApprovalPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ServiceApprovalPage(props: ServiceApprovalPageProps) {
  const params = use(props.params);
  const { toast } = useToast();

  // In a real app, you would fetch this data based on the ID
  const service = {
    id: Number.parseInt(params.id),
    title: "Custom Hair Coloring and Highlights",
    category: "Main HairCuts",
    images: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    salon: {
      name: "Salon Amaya",
      logo: "/placeholder.svg?height=100&width=100",
      isBestSeller: true,
    },
    price: 1500,
    startedDate: "2024 Nov 26",
    updatedDate: "2024 Dec 26",
    instructions: [
      "Wash your hair 1-2 days before coloring. Freshly washed hair can strip natural oils, making it more porous and potentially leading to uneven color.",
      "Use a deep conditioner or hair mask to hydrate your hair. This helps protect it from the chemicals in the dye.",
    ],
    staffMembers: [
      {
        id: 1,
        name: "Staff Member 1",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 2,
        name: "Staff Member 2",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 3,
        name: "Staff Member 3",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 4,
        name: "Staff Member 4",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 5,
        name: "Staff Member 5",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 6,
        name: "Staff Member 6",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    updates: ["PRICE", "INSTRUCTIONS"],
  };

  const handleApprove = () => {
    toast({
      title: "Service approved",
      description: "The service has been approved and is now active.",
    });
    // In a real app, you would submit this to your backend
  };

  const handleReject = () => {
    toast({
      title: "Service rejected",
      description: "The service has been rejected.",
      variant: "destructive",
    });
    // In a real app, you would submit this to your backend
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/service-cards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{service.title}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div>
            <Link
              href={`/service/${service.category
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {service.category}
            </Link>
            <h2 className="text-2xl font-bold mt-2">{service.title}</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {service.images.map((image, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] rounded-lg overflow-hidden"
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Service image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-80"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Instructions</h3>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            </div>
            <ul className="space-y-2 list-disc pl-5">
              {service.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700">
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Staff Members</h3>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {service.staffMembers.map((staff) => (
                <div key={staff.id} className="flex flex-col items-center">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2">
                    <Image
                      src={staff.image || "/placeholder.svg"}
                      alt={staff.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs text-center text-gray-600">
                    Staff Member
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-yellow-100">
                  <Image
                    src={service.salon.logo || "/placeholder.svg"}
                    alt={service.salon.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {service.salon.name}
                  </h3>
                  {service.salon.isBestSeller && (
                    <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full inline-block">
                      Best Seller
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-semibold">
                    From LKR {service.price}.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Started Date:</span>
                  <span>{service.startedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated Date:</span>
                  <span>{service.updatedDate} (Today)</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Updates:</h4>
                <div className="flex flex-wrap gap-2">
                  {service.updates.map((update, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                    >
                      {update}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleApprove}
                >
                  Approve
                </Button>
                <Button
                  variant="cancel"
                  className="w-full"
                  onClick={handleReject}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
