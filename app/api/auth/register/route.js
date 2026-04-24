
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요' }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    const token = signToken({ id: result.insertId, username, email });
    return NextResponse.json({ token, username }, { status: 201 });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: '이미 존재하는 이메일 또는 아이디입니다' }, { status: 409 });
    }
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
