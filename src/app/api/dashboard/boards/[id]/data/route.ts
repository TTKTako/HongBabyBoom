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

  try {
    // Verify board belongs to the current user
    const [[board]] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM proj_boards WHERE id = ? AND user_id = ?',
      [boardId, user.userId],
    );
    if (!board) return NextResponse.json({ error: 'Board not found.' }, { status: 404 });

    // 3-hour average sensor data — anchored at NOW() for online boards.
    // Falls back to the last-known 3-hour window for offline boards.
    const [[recentSensor]] = await pool.query<RowDataPacket[]>(`
      SELECT
        AVG(temperature_c)   AS avg_temp,
        AVG(humidity_pct)    AS avg_humidity,
        AVG(light_lux)       AS avg_light,
        SUM(motion_detected) AS motion_count,
        COUNT(*)             AS reading_count,
        MAX(recorded_at)     AS last_recorded_at
      FROM proj_sensor_readings
      WHERE board_id = ? AND recorded_at >= DATE_SUB(NOW(), INTERVAL 3 HOUR)
    `, [boardId]);

    let sensor = recentSensor;
    let isHistorical = false;

    // If the board hasn't sent data in the last 3 h (offline), show the most
    // recent 3-hour window anchored on its last known reading instead.
    if (Number(sensor?.reading_count ?? 0) === 0) {
      const [[fallback]] = await pool.query<RowDataPacket[]>(`
        SELECT
          AVG(temperature_c)   AS avg_temp,
          AVG(humidity_pct)    AS avg_humidity,
          AVG(light_lux)       AS avg_light,
          SUM(motion_detected) AS motion_count,
          COUNT(*)             AS reading_count,
          MAX(recorded_at)     AS last_recorded_at
        FROM proj_sensor_readings
        WHERE board_id = ?
          AND recorded_at >= DATE_SUB(
            (SELECT MAX(recorded_at) FROM proj_sensor_readings WHERE board_id = ?),
            INTERVAL 3 HOUR
          )
      `, [boardId, boardId]);
      if (fallback && Number(fallback.reading_count) > 0) {
        sensor  = fallback;
        isHistorical = true;
      }
    }

    // Latest outdoor weather snapshot
    const [[outdoor]] = await pool.query<RowDataPacket[]>(`
      SELECT
        outdoor_temp_c,
        outdoor_humidity_pct,
        weather_condition,
        fetched_at
      FROM proj_outdoor_weather_snapshots
      WHERE board_id = ?
      ORDER BY fetched_at DESC
      LIMIT 1
    `, [boardId]);

    // Latest comfort score
    const [[comfort]] = await pool.query<RowDataPacket[]>(`
      SELECT cs.score_label, cs.model_confidence
      FROM   proj_comfort_scores cs
      JOIN   proj_sensor_readings sr ON cs.reading_id = sr.id
      WHERE  sr.board_id = ?
      ORDER  BY sr.recorded_at DESC
      LIMIT  1
    `, [boardId]);

    // Compute deltas from the 3h average vs outdoor
    const avgTemp     = sensor?.avg_temp     != null ? parseFloat(sensor.avg_temp)     : null;
    const avgHumidity = sensor?.avg_humidity != null ? parseFloat(sensor.avg_humidity) : null;
    const avgLight    = sensor?.avg_light    != null ? parseFloat(sensor.avg_light)    : null;
    const outdoorTemp = outdoor?.outdoor_temp_c         ?? null;
    const outdoorHum  = outdoor?.outdoor_humidity_pct   ?? null;

    const deltaTemp     = avgTemp     != null && outdoorTemp != null ? +(avgTemp - outdoorTemp).toFixed(1)     : null;
    const deltaHumidity = avgHumidity != null && outdoorHum  != null ? +(avgHumidity - outdoorHum).toFixed(1) : null;

    return NextResponse.json({
      avg_temp:          avgTemp,
      avg_humidity:      avgHumidity,
      avg_light:         avgLight,
      motion_count:      Number(sensor?.motion_count)  || 0,
      reading_count:     Number(sensor?.reading_count) || 0,
      outdoor_temp:      outdoorTemp,
      outdoor_humidity:  outdoorHum,
      weather_condition: outdoor?.weather_condition ?? null,
      outdoor_fetched_at: outdoor?.fetched_at        ?? null,
      delta_temp:        deltaTemp,
      delta_humidity:    deltaHumidity,
      comfort_label:     comfort?.score_label      ?? null,
      model_confidence:  comfort?.model_confidence ?? null,
      last_recorded_at:  sensor?.last_recorded_at  ?? null,
      is_historical:     isHistorical,
    });
  } catch (err) {
    console.error('[dashboard/boards/[id]/data GET]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
