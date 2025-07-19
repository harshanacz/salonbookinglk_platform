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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

type Verification = {
  id: string;
  salonId: string;
  salonName: string;
  ownerName: string;
  email: string;
  profileImage?: string;
  businessRegistrationNumber?: string;
  phoneNumber: string;
  address: string;
  website?: string;
  description: string;
  isVerified: boolean;
  submittedAt: string;
  createdAt: string;
  status: string;
};

const Page = () => {
  const [verifications, setVerifications] = React.useState<Verification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/verifications?status=pending");
      
      if (!response.ok) {
        throw new Error("Failed to fetch verifications");
      }
      
      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (err) {
      console.error("Error fetching verifications:", err);
      setError("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVerifications();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verifications</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading verification requests...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verifications</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchVerifications}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verifications</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            Review and approve salon verification requests ({verifications.length} pending)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending verification requests</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Salon</TableHead>
                    <TableHead className="w-1/4">Owner</TableHead>
                    <TableHead className="w-1/4">Submitted Date</TableHead>
                    <TableHead className="w-1/4">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((verification: Verification) => (
                    <TableRow key={verification.id}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={verification.profileImage} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{verification.salonName}</span>
                            <p className="text-sm text-gray-500">{verification.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{verification.ownerName}</span>
                          <p className="text-sm text-gray-500">{verification.phoneNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(verification.submittedAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            verification.status === "PENDING" ? "default" : 
                            verification.status === "APPROVED" ? "default" : "secondary"
                          }
                          className={
                            verification.status === "PENDING" ? "bg-orange-100 text-orange-800" :
                            verification.status === "APPROVED" ? "bg-green-100 text-green-800" : ""
                          }
                        >
                          {verification.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm">
                          <Link href={`/admin/verification/${verification.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
