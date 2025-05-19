import { NextRequest, NextResponse } from "next/server";

let appointments: any[] = [];

export async function GET() {
  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const appointment = {
    id: Date.now(),
    ...data,
    status: data.status || "pending",
  };
  appointments.push(appointment);
  return NextResponse.json({ success: true, appointment }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const idx = appointments.findIndex((a) => a.id === data.id);
  if (idx !== -1) {
    appointments[idx].status = data.status;
    return NextResponse.json({ success: true, appointment: appointments[idx] });
  }
  return NextResponse.json({ success: false, message: "Appointment not found" }, { status: 404 });
}