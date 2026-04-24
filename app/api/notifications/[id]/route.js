
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  await pool.execute(
    'UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',
    [params.id, user.id]
  );
  return NextResponse.json({ success: true });
}
