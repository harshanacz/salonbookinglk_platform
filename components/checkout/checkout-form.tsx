// components/checkout/CheckoutForm.tsx
'use client';

import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
}

const CheckoutForm = ({ amount, onPaymentSuccess, onPaymentError }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const usdAmount = amount / 300;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Submit the form to get the latest data
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setErrorMessage(submitError.message || 'Submission failed');
        onPaymentError(submitError.message || 'Submission failed');
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setErrorMessage(error.message || 'Payment failed');
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        console.log('Payment successful:', paymentIntent);
        if (paymentIntent.status === 'succeeded') {
          onPaymentSuccess(paymentIntent.id);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('An unexpected error occurred');
      onPaymentError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
          <p className="text-gray-600">Amount: LKR {amount.toFixed(2)}</p>
        </div>

        <div className="border border-gray-200 p-4 rounded-lg">
          <PaymentElement 
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  email: 'customer@example.com',
                }
              }
            }}
          />
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay LKR${amount.toFixed(2)}`
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;