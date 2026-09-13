import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, OrderValidationError } from '@/lib/db';

export async function GET() {
  try {
    const data = await getOrders();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await createOrder(body);
    return NextResponse.json(data);
  } catch (error: any) {
    const status = error instanceof OrderValidationError ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}