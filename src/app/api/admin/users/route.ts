import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface UserRow extends RowDataPacket {
  id: number;
  display_name: string;
  role: string;
  created_at: string;
}

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('nestsense_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || (payload.role ?? 'user') !== 'admin') return null;
  return payload;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, display_name, role, created_at FROM proj_users ORDER BY id ASC'
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[admin/users GET]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
