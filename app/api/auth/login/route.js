// ═══════════════════════════════════════════════════════
// POST /api/auth/login  —  로그인
//
// 처리 순서:
//   1. 이메일로 유저 조회
//   2. bcrypt.compare로 비밀번호 검증
//   3. JWT 발급 (24시간 유효)
//
// 보안: 이메일 없음/비번 틀림 모두 동일한 에러 메시지
//       → 계정 존재 여부 노출 방지
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다' }, { status: 401 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return NextResponse.json({ error: '이메일 또는 비밀번호가 틀렸습니다' }, { status: 401 });
    }

    const token = signToken({ id: user.id, username: user.username, email: user.email });
    return NextResponse.json({ token, username: user.username });

  } catch (err) {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
