import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface BoardRow extends RowDataPacket {
  id: number;
  area_name: string;
  board_token: string;
  latitude: string;
  longitude: string;
  is_active: number;
  last_seen_at: string | null;
  registered_at: string;
  latest_temp: number | null;
  latest_humidity: number | null;
  latest_comfort: string | null;
}

async function requireUser(req: NextRequest) {
  const token = req.cookies.get('nestsense_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await pool.query<BoardRow[]>(`
      SELECT
        b.id,
        b.room_name                                                                        AS area_name,
        b.board_token,
        b.latitude,
        b.longitude,
        b.is_active,
        b.last_seen_at,
        b.registered_at,
        (SELECT sr.temperature_c
         FROM   proj_sensor_readings sr
         WHERE  sr.board_id = b.id
         ORDER  BY sr.recorded_at DESC
         LIMIT  1)                                                                         AS latest_temp,
        (SELECT sr.humidity_pct
         FROM   proj_sensor_readings sr
         WHERE  sr.board_id = b.id
         ORDER  BY sr.recorded_at DESC
         LIMIT  1)                                                                         AS latest_humidity,
        (SELECT cs.score_label
         FROM   proj_comfort_scores cs
         JOIN   proj_sensor_readings sr ON cs.reading_id = sr.id
         WHERE  sr.board_id = b.id
         ORDER  BY sr.recorded_at DESC
         LIMIT  1)                                                                          AS latest_comfort
      FROM  proj_boards b
      WHERE b.user_id = ?
      ORDER BY b.registered_at ASC
    `, [user.userId]);

    const now = Date.now();
    const boards = rows.map((b) => ({
      id: b.id,
      area_name: b.area_name,
      board_token: b.board_token,
      lat: parseFloat(b.latitude),
      lng: parseFloat(b.longitude),
      online: b.last_seen_at
        ? now - new Date(b.last_seen_at).getTime() < 5 * 60 * 1000
        : false,
      last_seen_at: b.last_seen_at,
      registered_at: b.registered_at,
      latest_temp:    b.latest_temp    ?? null,
      latest_humidity: b.latest_humidity ?? null,
      latest_comfort: (b.latest_comfort as 'Comfortable' | 'Moderate' | 'Uncomfortable' | null) ?? null,
    }));

    return NextResponse.json(boards);
  } catch (err) {
    console.error('[dashboard/boards GET]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const area_name   = typeof body.area_name   === 'string' ? body.area_name.trim()   : '';
    const board_token = typeof body.board_token === 'string' ? body.board_token.trim() : '';
    const lat = typeof body.lat === 'number' ? body.lat : null;
    const lng = typeof body.lng === 'number' ? body.lng : null;

    if (!area_name)               return NextResponse.json({ error: 'Area name is required.'      }, { status: 400 });
    if (!board_token)             return NextResponse.json({ error: 'Board token is required.'    }, { status: 400 });
    if (lat === null || lng === null) return NextResponse.json({ error: 'Location is required.'  }, { status: 400 });
    if (lat < -90  || lat > 90)   return NextResponse.json({ error: 'Invalid latitude.'          }, { status: 400 });
    if (lng < -180 || lng > 180)  return NextResponse.json({ error: 'Invalid longitude.'         }, { status: 400 });

    // Find board by token
    const [[existing]] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id FROM proj_boards WHERE board_token = ?',
      [board_token],
    );

    if (!existing) {
      return NextResponse.json({ error: 'Board token not found. Make sure the board is registered in the system.' }, { status: 404 });
    }

    if (Number(existing.user_id) !== 0) {
      return NextResponse.json({ error: 'This board is already claimed by another account.' }, { status: 409 });
    }

    // Claim the unassigned board
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE proj_boards SET user_id = ?, room_name = ?, latitude = ?, longitude = ? WHERE board_token = ? AND user_id = 0',
      [user.userId, area_name, lat, lng, board_token],
    );

    if (!result.affectedRows) {
      // Race condition: someone else claimed between SELECT and UPDATE
      return NextResponse.json({ error: 'This board was just claimed by another account.' }, { status: 409 });
    }

    return NextResponse.json({ id: existing.id, success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error('[dashboard/boards POST]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
