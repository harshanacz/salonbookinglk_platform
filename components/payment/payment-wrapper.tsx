// components/payment/PaymentWrapper.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { ReactNode } from 'react';

interface PaymentWrapperProps {
  children: ReactNode;
  clientSecret?: string;
}

const PaymentWrapper = ({ children, clientSecret }: PaymentWrapperProps) => {
  const stripePromise = getStripe();

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#7c3aed',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={clientSecret ? options : undefined}>
      {children}
    </Elements>
  );
};

export default PaymentWrapper;