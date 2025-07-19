import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage for demonstration
let bills: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const billData = await request.json();
    
    console.log('Creating bill with data:', billData);
    
    const newBill = {
      id: Date.now().toString(),
      customerName: billData.customerName,
      services: billData.services,
      date: billData.date,
      time: billData.time,
      amount: billData.amount,
      paymentMethod: billData.paymentMethod,
      status: billData.status,
      salonId: billData.salonId,
      appointmentId: billData.appointmentId,
      createdAt: new Date().toISOString(),
    };
    
    bills.push(newBill);
    console.log('✅ Bill created successfully. Total bills:', bills.length);
    console.log('📋 All bills:', bills);
    
    return NextResponse.json({ 
      success: true, 
      billId: newBill.id,
      message: 'Bill created successfully',
      totalBills: bills.length 
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📖 GET /api/bills - Fetching bills. Total:', bills.length);
    console.log('📋 All bills in memory:', bills);
    
    return NextResponse.json({ 
      bills: bills,
      totalCount: bills.length
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { billId, status } = await request.json();
    console.log('📝 Updating bill:', billId, 'to status:', status);
  
    
    const billIndex = bills.findIndex(bill => bill.id === billId);
    
    if (billIndex === -1) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }
    
    bills[billIndex] = {
      ...bills[billIndex],
      status: status,
      updatedAt: new Date().toISOString()
    };
    console.log('✅ Bill updated successfully:', bills[billIndex]);
    return NextResponse.json({ 
      success: true, 
      message: 'Bill status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating bill status:', error);
    return NextResponse.json(
      { error: 'Failed to update bill status' },
      { status: 500 }
    );
  }
}