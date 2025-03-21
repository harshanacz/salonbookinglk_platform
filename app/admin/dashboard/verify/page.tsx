"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";

type Salon = {
  id: string;
  name: string;
  image: string;
  status: string;
  startedDate: string;
  updatedDate: string;
};

const fetchSalonData = async (): Promise<Salon[]> => {
  const response = await fetch("/verify.json");
  const data = await response.json();
  return data.salons;
};

const Page = () => {
  const [salonData, setSalonData] = React.useState<Salon[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSalonData();
      setSalonData(data);
    };
    fetchData();
  }, []);

  return (
    <div className="w-full mx-auto md:w-5/6 my-10">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-medium mb-6">Pending Approval</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Salon</TableHead>
                <TableHead className="w-1/4">Status</TableHead>
                <TableHead className="w-1/4">Started Date</TableHead>
                <TableHead className="w-1/4">Updated Date</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salonData.map((salon: Salon) => (
                <TableRow key={salon.id}>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-yellow-200">
                        <Image
                          src={salon.image}
                          alt={`${salon.name} logo`}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <span>{salon.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{salon.status}</TableCell>
                  <TableCell>{salon.startedDate}</TableCell>
                  <TableCell>{salon.updatedDate}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/dashboard/verify/${salon.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;