// ═══════════════════════════════════════════════════════
// DELETE /api/subscriptions/[category]  —  구독 해지
//
// AND user_id = ? 로 본인 구독만 삭제 가능
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { category } = await params;

  await pool.execute(
    'DELETE FROM subscriptions WHERE user_id = ? AND category = ?',
    [user.id, category]
  );
  return NextResponse.json({ success: true });
}
