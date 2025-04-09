"use client";

import { useState } from "react";
import TabNavigation from "./components/TabNavigation";
import BasicDetailsForm from "./components/BasicDetailsForm";
import PricingForm from "./components/PricingForm";
import StaffForm from "./components/StaffForm";
import MoreInfoForm from "./components/MoreInfoForm";
import { Button } from "@/components/ui/button";

export default function CreateServicePage() {
  const [currentStep, setCurrentStep] = useState(0);

  const renderStepForm = () => {
    switch (currentStep) {
      case 0:
        return <BasicDetailsForm />;
      case 1:
        return <PricingForm />;
      case 2:
        return <StaffForm />;
      case 3:
        return <MoreInfoForm />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === 3;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Create a New Service</h1>
      <p className="text-gray-500 text-lg mb-4">
        {["Basic Details", "Pricing and duration", "Staff / Team Members", "More Details"][currentStep]}
      </p>

      <TabNavigation currentStep={currentStep} setCurrentStep={setCurrentStep} />

      <div className="mt-8">{renderStepForm()}</div>

      <div className="flex justify-end mt-10">
        <Button
          onClick={() => {
            if (!isLastStep) setCurrentStep((prev) => prev + 1);
            else alert("Finish clicked ✅");
          }}
        >
          {isLastStep ? "Save & Publish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
