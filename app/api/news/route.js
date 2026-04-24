// ═══════════════════════════════════════════════════════
// GET /api/news?category=corn  —  뉴스 조회
//
// category 파라미터 없으면 전체 뉴스 반환
// category 있으면 해당 카테고리만 필터링
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const [rows] = category
    ? await pool.execute(
        'SELECT * FROM news WHERE category = ? ORDER BY created_at DESC',
        [category]
      )
    : await pool.execute('SELECT * FROM news ORDER BY created_at DESC');

  return NextResponse.json({ news: rows });
}
