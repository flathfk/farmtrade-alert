// ═══════════════════════════════════════════════════════
// DELETE /api/auth/delete  —  회원 탈퇴
//
// users 테이블에서 삭제
// ON DELETE CASCADE로 연관 데이터 자동 삭제:
//   alert_conditions, notifications, trades, subscriptions
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function DELETE(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await pool.execute('DELETE FROM users WHERE id = ?', [user.id]);
  return NextResponse.json({ success: true });
}
