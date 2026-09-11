import { NextRequest, NextResponse } from 'next/server';
import { toggleCustomerActive } from '@/lib/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const active = typeof body?.active === 'boolean' ? body.active : true;

        const numericId = Number(id);
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid customer ID format' }, { status: 400 });
        }

        await toggleCustomerActive(numericId, active);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error toggling customer active status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to toggle customer active status' },
            { status: 500 }
        );
    }
}