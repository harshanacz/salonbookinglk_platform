import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata } = await request.json();

    console.log('Creating payment intent for amount:', amount);

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

     const lkrToUsdRate = 300; 
    const usdAmount = Math.round((amount / lkrToUsdRate) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: usdAmount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata:{
        ...metadata,
        type: 'salon_booking'
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
}