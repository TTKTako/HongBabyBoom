import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('nestsense_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || (payload.role ?? 'user') !== 'admin') return null;
  return payload;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const targetId = Number(id);
  if (!targetId) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  try {
    const body = await req.json();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (typeof body.display_name === 'string' && body.display_name.trim()) {
      fields.push('display_name = ?');
      values.push(body.display_name.trim());
    }
    if (body.role === 'admin' || body.role === 'user') {
      // Prevent removing the last admin
      if (body.role === 'user') {
        const [[{ count }]] = await pool.query<RowDataPacket[]>(
          "SELECT COUNT(*) as count FROM proj_users WHERE role = 'admin'"
        );
        if (count <= 1 && admin.userId === targetId) {
          return NextResponse.json(
            { error: 'Cannot demote the last admin account.' },
            { status: 400 }
          );
        }
      }
      fields.push('role = ?');
      values.push(body.role);
    }

    if (!fields.length) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    values.push(targetId);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE proj_users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (!result.affectedRows) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/users PATCH]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const targetId = Number(id);
  if (!targetId) return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  // Prevent admin from deleting their own account
  if (admin.userId === targetId) {
    return NextResponse.json({ error: 'Cannot delete your own account.' }, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM proj_users WHERE id = ?',
      [targetId]
    );
    if (!result.affectedRows) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/users DELETE]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
