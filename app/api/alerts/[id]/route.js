
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { threshold_price, condition_type, is_active } = await request.json();
  await pool.execute(
    'UPDATE alert_conditions SET threshold_price=?, condition_type=?, is_active=? WHERE id=? AND user_id=?',
    [threshold_price, condition_type, is_active, params.id, user.id]
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await pool.execute(
    'DELETE FROM alert_conditions WHERE id=? AND user_id=?',
    [params.id, user.id]
  );
  return NextResponse.json({ success: true });
}
