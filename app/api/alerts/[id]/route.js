// ═══════════════════════════════════════════════════════
// PUT    /api/alerts/[id]  —  알림 조건 수정
// DELETE /api/alerts/[id]  —  알림 조건 삭제
//
// AND user_id = ? 로 본인 데이터만 수정/삭제 가능
// Next.js 15에서 params는 비동기 → await params 필수
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { id } = await params;
  const { threshold_price, condition_type, is_active } = await request.json();

  await pool.execute(
    'UPDATE alert_conditions SET threshold_price=?, condition_type=?, is_active=? WHERE id=? AND user_id=?',
    [threshold_price, condition_type, is_active, id, user.id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { id } = await params;

  await pool.execute(
    'DELETE FROM alert_conditions WHERE id=? AND user_id=?',
    [id, user.id]
  );
  return NextResponse.json({ success: true });
}
