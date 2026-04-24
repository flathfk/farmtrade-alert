// ═══════════════════════════════════════════════════════
// PATCH /api/notifications/read-all  —  전체 알림 읽음 처리
//
// 알림 페이지 진입 시 호출
// 해당 유저의 모든 is_read=0 알림을 is_read=1로 일괄 업데이트
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function PATCH(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await pool.execute(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [user.id]
  );
  return NextResponse.json({ success: true });
}
