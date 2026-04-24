// ═══════════════════════════════════════════════════════
// GET  /api/subscriptions  —  내 구독 카테고리 목록
// POST /api/subscriptions  —  카테고리 구독 추가
//
// INSERT IGNORE: UNIQUE KEY로 중복 구독 방지
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const [rows] = await pool.execute(
    'SELECT category FROM subscriptions WHERE user_id = ?',
    [user.id]
  );
  return NextResponse.json({ subscriptions: rows.map(r => r.category) });
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { category } = await request.json();

  await pool.execute(
    'INSERT IGNORE INTO subscriptions (user_id, category) VALUES (?, ?)',
    [user.id, category]
  );
  return NextResponse.json({ success: true });
}
