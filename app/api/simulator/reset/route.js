// ═══════════════════════════════════════════════════════
// DELETE /api/simulator/reset  —  거래 내역 초기화
//
// 해당 유저의 trades 전체 삭제
// 잔고는 자동으로 초기값(10,000,000원)으로 복귀
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function DELETE(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await pool.execute('DELETE FROM trades WHERE user_id = ?', [user.id]);
  return NextResponse.json({ success: true });
}
