// ═══════════════════════════════════════════════════════
// PUT /api/auth/password  —  비밀번호 변경
//
// 처리 순서:
//   1. JWT로 현재 로그인 유저 확인
//   2. 현재 비밀번호 검증
//   3. 새 비밀번호 해시 후 DB 업데이트
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function PUT(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();

  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [user.id]);
  if (rows.length === 0) return NextResponse.json({ error: '사용자 없음' }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) return NextResponse.json({ error: '현재 비밀번호가 틀렸습니다' }, { status: 401 });

  const hash = await bcrypt.hash(newPassword, 10);
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id]);

  return NextResponse.json({ success: true });
}
