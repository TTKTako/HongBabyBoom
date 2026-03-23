/**
 * Seed script — run with: npm run seed
 * Populates the database with demo users, boards, sensor readings,
 * comfort scores, and outdoor weather snapshots.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to database.');

  // ─── Users ─────────────────────────────────────────────────────────────────
  const users: { displayName: string; password: string }[] = [
    { displayName: 'demo',  password: 'demo123' },
    { displayName: 'admin', password: 'admin123' },
  ];

  const userIds: Record<string, number> = {};

  for (const u of users) {
    const [existing] = await db.query<mysql.RowDataPacket[]>(
      'SELECT id FROM proj_users WHERE display_name = ?', [u.displayName]
    );
    if ((existing as mysql.RowDataPacket[]).length > 0) {
      userIds[u.displayName] = (existing as mysql.RowDataPacket[])[0].id as number;
      console.log(`  User "${u.displayName}" already exists (id=${userIds[u.displayName]}), skipping.`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 12);
    const [res] = await db.query<mysql.ResultSetHeader>(
      'INSERT INTO proj_users (display_name, password_hash) VALUES (?, ?)',
      [u.displayName, hash]
    );
    userIds[u.displayName] = res.insertId;
    console.log(`  Created user "${u.displayName}" (id=${res.insertId})`);
  }

  // ─── Boards ─────────────────────────────────────────────────────────────────
  const boardDefs = [
    { user: 'demo',  roomName: 'Living Room', lat: 13.848000, lng: 100.569000 },
    { user: 'demo',  roomName: 'Bedroom',     lat: 13.850000, lng: 100.572000 },
    { user: 'demo',  roomName: 'Kitchen',     lat: 13.847000, lng: 100.574000 },
    { user: 'admin', roomName: 'Study Room',  lat: 13.852000, lng: 100.567000 },
    { user: 'admin', roomName: 'Bathroom',    lat: 13.848500, lng: 100.570500 },
  ];

  const boardIds: number[] = [];

  for (const b of boardDefs) {
    const token = crypto.randomBytes(32).toString('hex');
    const userId = userIds[b.user];
    const [res] = await db.query<mysql.ResultSetHeader>(
      `INSERT INTO proj_boards (user_id, board_token, room_name, latitude, longitude, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [userId, token, b.roomName, b.lat, b.lng]
    );
    boardIds.push(res.insertId);
    console.log(`  Created board "${b.roomName}" (id=${res.insertId})`);
  }

  // ─── Sensor readings + comfort scores ──────────────────────────────────────
  function comfortLabel(temp: number, humidity: number): string {
    if (temp > 28 || humidity > 70) return 'Uncomfortable';
    if (temp > 26 || humidity > 60) return 'Moderate';
    return 'Comfortable';
  }

  for (const boardId of boardIds) {
    for (let i = 23; i >= 0; i--) {
      const temp   = +(24 + Math.random() * 8).toFixed(1);
      const humid  = +(45 + Math.random() * 35).toFixed(1);
      const light  = Math.floor(Math.random() * 800 + 100);
      const motion = Math.random() > 0.5 ? 1 : 0;
      const recAt  = new Date(Date.now() - i * 30 * 60 * 1000);

      const [rRes] = await db.query<mysql.ResultSetHeader>(
        `INSERT INTO proj_sensor_readings
           (board_id, temperature_c, humidity_pct, light_lux, motion_detected, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [boardId, temp, humid, light, motion, recAt]
      );

      const label      = comfortLabel(temp, humid);
      const confidence = +(0.78 + Math.random() * 0.20).toFixed(2);
      await db.query(
        `INSERT INTO proj_comfort_scores
           (reading_id, score_label, model_confidence, scoring_method)
         VALUES (?, ?, ?, 'ml_model')`,
        [rRes.insertId, label, confidence]
      );
    }
    console.log(`  Inserted 24 readings + scores for board id=${boardId}`);
  }

  // ─── Outdoor weather snapshots ──────────────────────────────────────────────
  const conditions = ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'];

  for (const boardId of boardIds) {
    for (let i = 0; i < 6; i++) {
      const outTemp   = +(28 + Math.random() * 6).toFixed(1);
      const outHumid  = +(55 + Math.random() * 25).toFixed(1);
      const deltaTemp  = +(Math.random() * 4 - 2).toFixed(1);
      const deltaHumid = +(Math.random() * 10 - 5).toFixed(1);
      const condition  = conditions[Math.floor(Math.random() * conditions.length)];
      const fetchedAt  = new Date(Date.now() - i * 60 * 60 * 1000);

      await db.query(
        `INSERT INTO proj_outdoor_weather_snapshots
           (board_id, outdoor_temp_c, outdoor_humidity_pct, weather_condition,
            delta_temp_c, delta_humidity_pct, fetched_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [boardId, outTemp, outHumid, condition, deltaTemp, deltaHumid, fetchedAt]
      );
    }
    console.log(`  Inserted 6 weather snapshots for board id=${boardId}`);
  }

  await db.end();
  console.log('\nSeed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

