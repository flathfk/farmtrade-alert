
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const [rows] = await pool.execute(
    'SELECT * FROM alert_conditions WHERE user_id = ? ORDER BY created_at DESC',
    [user.id]
  );
  return NextResponse.json({ alerts: rows });
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { crop_code, crop_name, threshold_price, condition_type } = await request.json();
  const [result] = await pool.execute(
    'INSERT INTO alert_conditions (user_id, crop_code, crop_name, threshold_price, condition_type) VALUES (?, ?, ?, ?, ?)',
    [user.id, crop_code, crop_name, threshold_price, condition_type]
  );
  return NextResponse.json({ id: result.insertId }, { status: 201 });
}
