// app/payment-success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const intentId = searchParams.get('payment_intent');
    if (intentId) {
      setPaymentIntentId(intentId);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed and payment has been processed successfully.
          </p>
          
          {paymentIntentId && (
            <p className="text-sm text-gray-500 mb-6">
              Payment ID: {paymentIntentId}
            </p>
          )}
          
          <div className="space-y-3">
            <Link
              href="/user/booking/user-appointments"
              className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              View My Appointments
            </Link>
            
            <Link
              href="/salons"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Book Another Appointment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;