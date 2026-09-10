import { NextRequest, NextResponse } from 'next/server';
import { toggleProductActive } from '@/lib/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const active = typeof body?.active === 'boolean' ? body.active : true;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        await toggleProductActive(id, active);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error toggling product active status:', error);
        return NextResponse.json(
            { error: 'Failed to toggle product active status' },
            { status: 500 }
        );
    }
}
