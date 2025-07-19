// app/payment-failed/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

const PaymentFailedPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center mb-6">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          
          <p className="text-gray-600 mb-6">
            We couldn't process your payment. Please try again or contact support.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => router.push('/contact')}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;