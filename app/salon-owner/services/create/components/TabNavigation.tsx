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
    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm font-medium w-full">
      {steps.map((label, index) => {
        const isActive = currentStep === index + 1;
        return (
          <div
            key={label}
            className={cn(
              "items-center gap-2 w-full md:w-auto",
              isActive ? "flex" : "hidden md:flex"
            )}
          >
            <div
              className={cn(
                "transition-all px-4 py-2 rounded-full border border-transparent w-full md:w-auto",
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-fuchsia-400 text-white shadow-md scale-105"
                  : "bg-[#F3E5F5] text-purple-700"
              )}
              style={{ minWidth: 120 }}
            >
              {label}
            </div>
            {index < steps.length - 1 && (
              <span className="hidden md:inline text-purple-200 text-lg font-bold">⟶</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
