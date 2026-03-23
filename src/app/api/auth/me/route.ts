import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('nestsense_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  return NextResponse.json({ userId: payload.userId, displayName: payload.displayName, role: payload.role ?? 'user' });
}
