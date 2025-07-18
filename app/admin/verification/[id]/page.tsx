"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Verification {
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
  businessHours?: Array<{
    day: string;
    isOpen: boolean;
    open: string;
    close: string;
  }>;
}

export default function VerifyDocuments() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { toast } = useToast();
  const [verification, setVerification] = React.useState<Verification | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/verifications/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch verification data");
      }
      
      const data = await response.json();
      setVerification(data);
    } catch (error) {
      console.error("Error fetching verification:", error);
      toast({
        title: "Error",
        description: "Failed to load verification data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!id) return;
    fetchVerificationData();
  }, [id]);

  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  const confirmApprove = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve verification");
      }

      toast({
        title: "Salon approved",
        description: "The salon has been approved and is now verified.",
      });
      
      setApproveDialogOpen(false);
      // Redirect back to verifications list
      router.push("/admin/verification");
    } catch (error) {
      console.error("Error approving verification:", error);
      toast({
        title: "Error",
        description: "Failed to approve salon verification",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "reject" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject verification");
      }

      toast({
        title: "Salon rejected",
        description: "The salon verification has been rejected.",
        variant: "destructive",
      });
      
      setRejectDialogOpen(false);
      // Redirect back to verifications list
      router.push("/admin/verification");
    } catch (error) {
      console.error("Error rejecting verification:", error);
      toast({
        title: "Error",
        description: "Failed to reject salon verification",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadDocument = () => {
    if (verification?.businessRegistrationNumber) {
      window.open(verification.businessRegistrationNumber, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading verification details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 mb-4">Verification not found</p>
            <Button asChild>
              <Link href="/admin/verification">Back to Verifications</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/verification">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Verify Documents</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={verification.profileImage} className="object-cover" />
              <AvatarFallback>
                {verification.salonName?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle>{verification.salonName}</CardTitle>
                <Badge
                  variant={verification.isVerified ? "default" : "secondary"}
                  className={verification.isVerified ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                >
                  {verification.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              <CardDescription>Salon Verification Request</CardDescription>
              <p className="text-sm text-gray-500 mt-1">
                Submitted on {formatDate(verification.submittedAt)}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Salon Name:</div>
                <div className="font-medium">{verification.salonName}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Owner Name:</div>
                <div className="font-medium">{verification.ownerName}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Contact Number:</div>
                <div>{verification.phoneNumber}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Salon Address:</div>
                <div className="whitespace-pre-line">{verification.address}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Email Address:</div>
                <div>{verification.email}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Website:</div>
                <div>{verification.website || "-"}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Description:</div>
                <div className="text-sm">{verification.description}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Member Since:</div>
                <div>{formatDate(verification.createdAt)}</div>
              </div>
            </div>
          </div>

          {verification.businessRegistrationNumber && (
            <Card className="mb-8 border-dashed">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="text-muted-foreground min-w-[200px]">
                    Business Registration Certificate:
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadDocument}
                    className="w-fit"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Hours */}
          {verification.businessHours && verification.businessHours.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {verification.businessHours.map((hour) => (
                    <div key={hour.day} className="flex justify-between items-center py-1">
                      <span className="font-medium">{hour.day}</span>
                      <span className="text-sm">
                        {hour.isOpen ? `${hour.open} - ${hour.close}` : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
        
        {!verification.isVerified && (
          <CardContent className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t">
            <Button 
              variant="default" 
              className="w-full sm:w-32 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={processing}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              className="w-full sm:w-32"
              onClick={handleReject}
              disabled={processing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this salon? This salon will be marked as verified
              and will be able to operate on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApprove}
              className="bg-primary text-primary-foreground"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this salon? This action will notify the salon owner
              that their verification request was unsuccessful.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              className="bg-destructive text-destructive-foreground"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}