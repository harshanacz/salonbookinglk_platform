"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TabNavigation from "../../create/components/TabNavigation";
import BasicDetailsForm from "../../create/components/BasicDetailsForm";
import PricingForm from "../../create/components/PricingForm";
import StaffForm from "../../create/components/StaffForm";
import MoreInfoForm from "../../create/components/MoreInfoForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import ServiceImages from "../../create/components/ServiceImages";

export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    title: "",
    type: "",
    duration: "",
    price: "",
    description: "",
    staffAssigned: [],
    images: []
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 4;
  const isLastStep = currentStep === totalSteps;

  useEffect(() => {
    async function fetchService() {
      if (!id) {
        toast({
          title: "Error",
          description: "Service ID is missing",
          variant: "destructive",
        });
        router.push("/salon-owner/services");
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch(`/api/salon-owner/services/${id}`);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || `Failed to fetch service (Status: ${res.status})`);
        }

        const found = await res.json();
        
        if (!found) {
          throw new Error("Service not found");
        }

        // Ensure staffAssigned is always an array
        const staffAssigned = Array.isArray(found.staffAssigned) 
          ? found.staffAssigned 
          : found.staffAssigned 
            ? [found.staffAssigned] 
            : [];

        // Ensure images is always an array
        const images = Array.isArray(found.images) 
          ? found.images 
          : found.image 
            ? [found.image] 
            : [];

        setFormData({
          ...found,
          staffAssigned,
          images
        });
        setImageUrls(images);
      } catch (error: any) {
        console.error("Error fetching service:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load service details",
          variant: "destructive",
        });
        // Only redirect if it's a critical error
        if (error.message === "Service not found" || error.message.includes("Failed to fetch")) {
          router.push("/salon-owner/services");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchService();
  }, [id, router, toast]);

  // Enhanced validation for each step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return Boolean(formData.title?.trim() && formData.type?.trim());
      case 2:
        return Boolean(
          formData.duration && 
          formData.price && 
          !isNaN(Number(formData.duration)) && 
          !isNaN(Number(formData.price))
        );
      case 3:
        return Array.isArray(formData.staffAssigned) && formData.staffAssigned.length > 0;
      case 4:
        return Array.isArray(imageUrls) && imageUrls.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
      const errorMessages = {
        1: "Please fill in all required basic details",
        2: "Please fill in all required pricing details",
        3: "Please assign at least one staff member",
        4: "Please upload at least one image for your service"
      };
      
      toast({
        title: "Validation Error",
        description: errorMessages[currentStep as keyof typeof errorMessages],
        variant: "destructive",
      });
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateFormData = (data: any) => {
    setFormData((prev: any) => {
      const updated = { ...prev, ...data };
      // Ensure staffAssigned is always an array
      if (data.staffAssigned) {
        updated.staffAssigned = Array.isArray(data.staffAssigned) 
          ? data.staffAssigned 
          : [data.staffAssigned];
      }
      return updated;
    });
  };

  const handleFinalSubmit = async () => {
    if (!isStepValid()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before saving",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const finalData = {
      ...formData,
      images: imageUrls,
      id,
      // Ensure all required fields are present and properly formatted
      title: formData.title?.trim(),
      type: formData.type?.trim(),
      duration: Number(formData.duration),
      price: Number(formData.price),
      description: formData.description?.trim(),
      staffAssigned: Array.isArray(formData.staffAssigned) ? formData.staffAssigned : []
    };

    try {
      const response = await fetch(`/api/salon-owner/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });
      
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update service");
        } else {
          throw new Error(`Server error (${response.status}): Please try again later`);
        }
      }

      toast({
        title: "Success!",
        description: "Service updated successfully.",
        variant: "default",
      });
      router.push("/salon-owner/services");
    } catch (error: any) {
      console.error("[SERVICE_UPDATE]", error);
      toast({
        title: "Error Updating Service",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicDetailsForm formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <PricingForm formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StaffForm formData={formData} updateFormData={updateFormData} />;
      case 4:
        return (
          <MoreInfoForm formData={formData} updateFormData={updateFormData}>
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Service Images (Max 3)</h3>
              <ServiceImages
                images={imageUrls}
                onImagesChange={(newImages) => {
                  setImageUrls(newImages);
                  updateFormData({ images: newImages });
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                First image is used as the main image. Images up to 4MB, max 3.
              </p>
            </div>
          </MoreInfoForm>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TabNavigation currentStep={currentStep} setCurrentStep={setCurrentStep} />
      <div className="w-full bg-purple-100 border border-purple-100 rounded-3xl md:rounded-2xl shadow-lg p-4 md:p-8 transition-all duration-200 mx-auto md:mx-0">
        {renderStep()}
      </div>
      <div className="flex justify-between mt-10">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSaving}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={isLastStep ? handleFinalSubmit : handleNext}
          disabled={!isStepValid() || isSaving}
        >
          {isSaving && isLastStep ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isLastStep ? "Save Changes" : "Next"}
        </Button>
      </div>
    </div>
  );
}