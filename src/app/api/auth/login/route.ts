import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

interface UserRow extends RowDataPacket {
  id: number;
  password_hash: string;
  display_name: string;
  role: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username: string = (body.username ?? '').trim();
    const password: string = body.password ?? '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, password_hash, display_name, role FROM proj_users WHERE display_name = ? LIMIT 1',
      [username]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, displayName: user.display_name, role: user.role ?? 'user' });

    const response = NextResponse.json({ success: true, displayName: user.display_name, role: user.role ?? 'user' });
    response.cookies.set('nestsense_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
