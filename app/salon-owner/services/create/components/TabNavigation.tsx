"use client";

import React from "react";
import { cn } from "@/lib/utils";

const steps = ["Basic Details", "Pricing & Time", "Staff/Team", "More Info"];

export default function TabNavigation({
  currentStep,
  setCurrentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) {
  return (
    <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
      {steps.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(index)}
            className={cn(
              "transition-colors",
              currentStep === index ? "text-purple-600" : "hover:text-black"
            )}
          >
            {label}
          </button>
          {index < steps.length - 1 && <span className="text-gray-300">➔</span>}
        </div>
      ))}
    </div>
  );
}
