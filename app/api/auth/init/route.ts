import { NextResponse } from 'next/server';
import { initAuth } from '@/lib/db';

export async function GET() {
  try {
    await initAuth();
    return NextResponse.json({ message: 'Auth initialized' }, { status: 200 });
  } catch (error: any) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}