"use client";

import { useState } from "react";
import TabNavigation from "./components/TabNavigation";
import BasicDetailsForm from "./components/BasicDetailsForm";
import PricingForm from "./components/PricingForm";
import StaffForm from "./components/StaffForm";
import MoreInfoForm from "./components/MoreInfoForm";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import ServiceImages from "./components/ServiceImages";

export default function CreateServicePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false); 
  const { toast } = useToast();

  const totalSteps = 4;
  const isLastStep = currentStep === totalSteps;

  // Validation for each step
  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.title && formData.type;
    }
    if (currentStep === 2) {
      return formData.duration && formData.price;
    }
    if (currentStep === 3) {
      return formData.staffAssigned && formData.staffAssigned.length > 0;
    }
    if (currentStep === 4) {
      return true; 
    }
    return false;
  };

  const handleNext = () => {
    if (!isStepValid()) return;
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
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true); // Start loading
    const finalData = { ...formData, images: imageUrls };

    try {
      const response = await fetch("/api/salon-owner/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        // Check content type to handle non-JSON responses
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create service");
        } else {
          // Handle non-JSON responses (like HTML error pages)
          const errorText = await response.text();
          console.error("Server responded with non-JSON content:", errorText);
          throw new Error(`Server error (${response.status}): Please try again later`);
        }
      }

      toast({
        title: "Success!",
        description: "Service created successfully and is now pending review.",
        variant: "default",
      });
      setCurrentStep(1);
      setFormData({});
      setImageUrls([]);
    } catch (error: any) {
      console.error("[SERVICE_CREATE_SUBMIT]", error);
      toast({
        title: "Error Creating Service",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
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

  return (
    <div className="space-y-8">
      <TabNavigation currentStep={currentStep} setCurrentStep={setCurrentStep} />

      {/* Adjusted container for full-width desktop and centered mobile */}
      <div
        className="w-full bg-purple-100 border border-purple-100 rounded-3xl md:rounded-2xl shadow-lg p-4 md:p-8 transition-all duration-200 mx-auto md:mx-0"
      >
        {renderStep()}
      </div>

      <div className="flex justify-between mt-10">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading} // Disable when loading
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={isLastStep ? handleFinalSubmit : handleNext}
          disabled={!isStepValid() || isLoading} // Disable when loading
        >
          {isLoading && isLastStep ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> // Show loader icon
          ) : null}
          {isLastStep ? "Save & Submit for Review" : "Next"}
        </Button>
      </div>
    </div>
  );
}
