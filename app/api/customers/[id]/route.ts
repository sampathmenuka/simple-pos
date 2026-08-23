import { NextRequest, NextResponse } from 'next/server';
import { updateCustomer, deleteCustomer } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }
    const customer = await updateCustomer(numericId, body);
    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: error.message || 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }
    await deleteCustomer(numericId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete customer' }, { status: 500 });
  }
}