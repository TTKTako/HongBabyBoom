import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function requireUser(req: NextRequest) {
  const token = req.cookies.get('nestsense_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const boardId = Number(id);
  if (!Number.isInteger(boardId) || boardId <= 0) {
    return NextResponse.json({ error: 'Invalid board id.' }, { status: 400 });
  }

  const url = new URL(req.url);
  const hours = Math.min(Math.max(Number(url.searchParams.get('hours') ?? '24'), 1), 168);

  try {
    // Verify board belongs to the current user
    const [[board]] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM proj_boards WHERE id = ? AND user_id = ?',
      [boardId, user.userId],
    );
    if (!board) return NextResponse.json({ error: 'Board not found.' }, { status: 404 });

    // Indoor readings grouped by hour
    const [indoorRows] = await pool.query<RowDataPacket[]>(`
      SELECT
        DATE_FORMAT(
          DATE_SUB(recorded_at, INTERVAL MOD(MINUTE(recorded_at), 60) MINUTE) -
          INTERVAL SECOND(recorded_at) SECOND,
          '%Y-%m-%dT%H:00:00'
        )                          AS hour_bucket,
        AVG(temperature_c)         AS avg_temp,
        AVG(humidity_pct)          AS avg_humidity
      FROM proj_sensor_readings
      WHERE board_id = ?
        AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY hour_bucket
      ORDER BY hour_bucket ASC
    `, [boardId, hours]);

    // Outdoor snapshots grouped by hour
    const [outdoorRows] = await pool.query<RowDataPacket[]>(`
      SELECT
        DATE_FORMAT(
          DATE_SUB(fetched_at, INTERVAL MOD(MINUTE(fetched_at), 60) MINUTE) -
          INTERVAL SECOND(fetched_at) SECOND,
          '%Y-%m-%dT%H:00:00'
        )                          AS hour_bucket,
        AVG(outdoor_temp_c)        AS avg_temp,
        AVG(outdoor_humidity_pct)  AS avg_humidity
      FROM proj_outdoor_weather_snapshots
      WHERE board_id = ?
        AND fetched_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      GROUP BY hour_bucket
      ORDER BY hour_bucket ASC
    `, [boardId, hours]);

    // Merge into a single timeline keyed by hour_bucket
    const buckets = new Map<string, { time: string; indoor_temp: number | null; indoor_humidity: number | null; outdoor_temp: number | null; outdoor_humidity: number | null }>();

    for (const row of indoorRows) {
      buckets.set(row.hour_bucket, {
        time: row.hour_bucket,
        indoor_temp: row.avg_temp != null ? +parseFloat(row.avg_temp).toFixed(1) : null,
        indoor_humidity: row.avg_humidity != null ? +parseFloat(row.avg_humidity).toFixed(1) : null,
        outdoor_temp: null,
        outdoor_humidity: null,
      });
    }

    for (const row of outdoorRows) {
      const existing = buckets.get(row.hour_bucket);
      if (existing) {
        existing.outdoor_temp = row.avg_temp != null ? +parseFloat(row.avg_temp).toFixed(1) : null;
        existing.outdoor_humidity = row.avg_humidity != null ? +parseFloat(row.avg_humidity).toFixed(1) : null;
      } else {
        buckets.set(row.hour_bucket, {
          time: row.hour_bucket,
          indoor_temp: null,
          indoor_humidity: null,
          outdoor_temp: row.avg_temp != null ? +parseFloat(row.avg_temp).toFixed(1) : null,
          outdoor_humidity: row.avg_humidity != null ? +parseFloat(row.avg_humidity).toFixed(1) : null,
        });
      }
    }

    const timeline = Array.from(buckets.values()).sort((a, b) => a.time.localeCompare(b.time));

    return NextResponse.json({ timeline, hours });
  } catch (err) {
    console.error('[dashboard/boards/[id]/history GET]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
