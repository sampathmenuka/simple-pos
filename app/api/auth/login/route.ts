import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await login(body.username, body.password);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}