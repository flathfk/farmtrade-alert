// ═══════════════════════════════════════════════════════
// GET  /api/simulator  —  거래 내역 + 현재 잔고 조회
// POST /api/simulator  —  거래 결과 저장
//
// 잔고 계산:
//   - 초기 잔고: 10,000,000원
//   - 마지막 거래의 balance_after가 현재 잔고
//   - 거래 없으면 초기 잔고 반환
// ═══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const [trades] = await pool.execute(
    'SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
    [user.id]
  );

  // 거래 내역 없으면 초기 잔고 10,000,000원
  const balance = trades.length > 0 ? trades[0].balance_after : 10000000;
  return NextResponse.json({ trades, balance });
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { asset, direction, leverage, margin, fee, pnl, balance_after } = await request.json();

  await pool.execute(
    'INSERT INTO trades (user_id, asset, direction, leverage, margin, fee, pnl, balance_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [user.id, asset, direction, leverage, margin, fee, pnl, balance_after]
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
