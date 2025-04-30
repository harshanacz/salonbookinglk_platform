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

export default function CreateServicePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create service");
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
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res) {
                    const newUrls = res.map((file) => file.url);
                    setImageUrls(newUrls.slice(0, 3));
                    updateFormData({ images: newUrls.slice(0, 3) });
                    toast({ description: "Image(s) uploaded." });
                  }
                }}
                onUploadError={(error: Error) => {
                  toast({
                    title: "Image Upload Error",
                    description: error.message,
                    variant: "destructive",
                  });
                }}
              />
              <div className="mt-4 flex gap-2 flex-wrap">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative w-20 h-20 border rounded overflow-hidden">
                    <img src={url} alt={`Service Image ${index + 1}`} className="object-cover w-full h-full" />
                    <span className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index === 0 ? "Header" : `Image ${index + 1}`}
                    </span>
                    <button
                      onClick={() => {
                        const newUrls = imageUrls.filter((_, i) => i !== index);
                        setImageUrls(newUrls);
                        updateFormData({ images: newUrls });
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs"
                      aria-label="Remove image"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">First image will be used as the header image.</p>
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
          disabled={currentStep === 1}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={isLastStep ? handleFinalSubmit : handleNext}
          disabled={!isStepValid()}
        >
          {isLastStep ? "Save & Submit for Review" : "Next"}
        </Button>
      </div>
    </div>
  );
}
