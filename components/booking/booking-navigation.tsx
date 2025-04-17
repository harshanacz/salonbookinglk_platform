"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BookingNavigationProps {
  salonId: number;
}

export default function BookingNavigation({ salonId }: BookingNavigationProps) {
  const pathname = usePathname();

  const steps = [
    { path: `/service/${salonId}/time`, name: "Time" },
    { path: `/service/${salonId}/confirm`, name: "Confirm" },
  ];

  return (
    <nav className="text-gray-600 mb-4 mt-5">
      {steps.map((step, index) => {
        const isCurrent = pathname === step.path;
        const isLast = index === steps.length - 1;

        return (
          <span key={step.path}>
            {isCurrent ? (
              <span className="text-black font-semibold pr-3">{step.name}</span>
            ) : (
              <Link
                href={step.path}
                className="text-gray-500 hover:underline pl-3 pr-3"
              >
                {step.name}
              </Link>
            )}
            {!isLast && " > "}
          </span>
        );
      })}
    </nav>
  );
}
