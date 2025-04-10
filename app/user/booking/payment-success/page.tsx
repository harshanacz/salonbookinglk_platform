"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failure">("pending");
  const router = useRouter();

  useEffect(() => {
    // Simulate payment processing delay
    const timer = setTimeout(() => {
      setPaymentStatus("success"); // Simulate successful payment
      setIsProcessing(false);
    }, 2000); // 2-second delay for processing

    return () => clearTimeout(timer);
  }, []);

  const handleBackToPayments = () => {
    router.push("/user/booking/user-appointments");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Confirmation</h1>
      {isProcessing ? (
        <div className="text-lg text-gray-600">Processing your payment...</div>
      ) : paymentStatus === "success" ? (
        <div className="text-center">
          <p className="text-xl text-green-600 font-semibold mb-2">Payment Successful!</p>
          <button
            className="bg-purple-700 text-white py-2 px-6 rounded-lg mt-4 hover:bg-purple-800"
            onClick={handleBackToPayments}
          >
            Back to Appointment Summary
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl text-red-600 font-semibold mb-2">Payment Failed</p>
          <button
            className="bg-purple-700 text-white py-2 px-6 rounded-lg mt-4 hover:bg-purple-800"
            onClick={handleBackToPayments}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}