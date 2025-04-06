"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Salon {
  id: string;
  name: string;
  shortName: string;
  owner: string;
  contact: string;
  email: string;
  businessRegNo: string;
  address: string;
  notes?: string;
  logoColor?: string;
}

const fetchSalonData = async (id: string) => {
  const response = await fetch("/verify.json");
  const data = await response.json();

  const salon = data.salons.find((salon: Salon) => salon.id === id);
  return salon || data.salons[0];
};

export default function VerifyDocuments() {
  const params = useParams();
  const id = params?.id as string;

  const [salon, setSalon] = React.useState<Salon | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const data = await fetchSalonData(id);
      setSalon(data);
    };
    fetchData();
  }, [id]);

  if (!salon) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full mx-auto md:w-5/6 ">
      <div className="container mx-auto">
        <h1 className="text-xl font-medium mb-8">Verify Documents</h1>

        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`relative w-16 h-16 rounded-full overflow-hidden ${salon.logoColor}`}
            >
              <Image
                src="/placeholder.svg?height=64&width=64"
                alt={`${salon.name} logo`}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>

            <h2 className="text-lg font-semibold">{salon.name}</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="text-gray-600">Salon Name :</div>
                <div>{salon.shortName}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="text-gray-600">Full Name :</div>
                <div>{salon.owner}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="text-gray-600">Contact Number :</div>
                <div>{salon.contact}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="text-gray-600">Salon Address :</div>
                <div className="whitespace-pre-line">{salon.address}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="text-gray-600">
                  Business Registration Number :
                </div>
                <div>{salon.businessRegNo}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="text-gray-600">Email Address :</div>
                <div>{salon.email}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-4">
                <div className="text-gray-600">Optional Notes :</div>
                <div>{salon.notes}</div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center">
              <div className="text-gray-600">
                Business Registration Certificate (PDF or Image)
              </div>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-md"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-1 justify-center">
            <Link href="/pending-verifications" className="w-full sm:w-80">
              <Button variant="success">Approve</Button>
            </Link>
            <Link href="/pending-verifications" className="w-full sm:w-80">
              <Button variant="cancel">Reject</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
