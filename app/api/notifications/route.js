
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const [rows] = await pool.execute(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [user.id]
  );
  return NextResponse.json({ notifications: rows });
}
