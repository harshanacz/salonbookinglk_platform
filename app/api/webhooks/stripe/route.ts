import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Appointment from '@/models/Appointment';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as { id: string };
        console.log('Payment succeeded:', paymentIntent.id);
        await Appointment.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    { 
      paymentStatus: 'COMPLETED',
      appointmentStatus: 'CONFIRMED',
      updatedAt: new Date()
    }
  );
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as { id: string };
        console.log('Payment failed:', failedPayment.id);
        await Appointment.findOneAndUpdate(
    { paymentIntentId: failedPayment.id },
    { 
      paymentStatus: 'FAILED',
      appointmentStatus: 'CANCELLED',
      updatedAt: new Date()
    }
  );
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}