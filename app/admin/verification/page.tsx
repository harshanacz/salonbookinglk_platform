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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verifications</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            Review and approve salon verification requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={salon.image} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span>{salon.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>
                        <Badge
                          variant={
                            salon.status === "NEW" ? "default" : "secondary"
                          }
                        >
                          {salon.status}
                        </Badge>
                      </span>
                    </TableCell>
                    <TableCell>{salon.startedDate}</TableCell>
                    <TableCell>{salon.updatedDate}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/admin/verification/${salon.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
