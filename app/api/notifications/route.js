// ═══════════════════════════════════════════════════════
// GET /api/notifications  —  내 알림 내역 조회 (최신 50개)
//
// 알림은 /api/prices 폴링 시 조건 충족되면 자동 생성됨
// is_read: 0 = 읽지 않음, 1 = 읽음
// ═══════════════════════════════════════════════════════
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
