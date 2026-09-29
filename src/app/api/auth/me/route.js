import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/adminAuth';

export async function GET() {
  const payload = await getSessionUser();

  if (!payload) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: payload });
}
