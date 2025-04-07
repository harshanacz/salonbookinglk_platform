"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
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
  const { toast } = useToast();
  const [salon, setSalon] = React.useState<Salon | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const data = await fetchSalonData(id);
      setSalon(data);
    };
    fetchData();
  }, [id]);

  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  const confirmApprove = () => {
    toast({
      title: "Salon approved",
      description: "The salon has been approved and is now active.",
    });
    // Add actual API call to approve salon here
  };

  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    toast({
      title: "Salon rejected",
      description: "The salon has been rejected.",
      variant: "destructive",
    });
    // Add actual API call to reject salon here
  };

  if (!salon) {
    return <div>Loading...</div>;
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
            <div>
              <CardTitle>{salon.name}</CardTitle>
              <CardDescription>Salon Verification Request</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Salon Name:</div>
                <div>{salon.shortName}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Full Name:</div>
                <div>{salon.owner}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Contact Number:</div>
                <div>{salon.contact}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Salon Address:</div>
                <div className="whitespace-pre-line">{salon.address}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Business Reg No:</div>
                <div className="break-all">{salon.businessRegNo}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Email Address:</div>
                <div>{salon.email}</div>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3 items-baseline">
                <div className="text-muted-foreground">Optional Notes:</div>
                <div>{salon.notes || "-"}</div>
              </div>
            </div>
          </div>

          <Card className="mb-8 border-dashed">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="text-muted-foreground min-w-[200px]">
                  Business Registration Certificate:
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-md shrink-0"
                >
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
        
        <CardContent className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <Button 
            variant="success" 
            className="w-full sm:w-28"
            onClick={handleApprove}
          >
            Approve
          </Button>
          <Button 
            variant="cancel" 
            className="w-full sm:w-28"
            onClick={handleReject}
          >
            Reject
          </Button>
        </CardContent>
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
    </div>
  );
}