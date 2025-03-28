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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetchSalonData();
      setSalonData(data);
    };
    fetchData();
  }, []);

  const filteredSalons = salonData.filter((salon) =>
    salon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verifications</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>Manage and verify salon registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search salons..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started Date</TableHead>
                <TableHead>Updated Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalons.map((salon: Salon) => (
                <TableRow key={salon.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                        <Image
                          src={salon.image}
                          alt={`${salon.name} logo`}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                      <span>{salon.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        salon.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : salon.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {salon.status}
                    </Badge>
                  </TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;