import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { signToken } from '@/lib/auth';

interface ExistingRow extends RowDataPacket {
  id: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const displayName: string = (body.displayName ?? '').trim();
    const password: string = body.password ?? '';

    if (!displayName || !password) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const [existing] = await pool.query<ExistingRow[]>(
      'SELECT id FROM proj_users WHERE display_name = ? LIMIT 1',
      [displayName]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO proj_users (display_name, password_hash) VALUES (?, ?)',
      [displayName, hash]
    );

    const token = await signToken({ userId: result.insertId, displayName });

    const response = NextResponse.json({ success: true, displayName });
    response.cookies.set('nestsense_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error('[signup]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
