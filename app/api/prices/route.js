import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUser } from '@/lib/auth';

const CROP_INFO = [
  { crop_code: '111', crop_name: '쌀',     unit: '20kg', basePrice: 45000 },
  { crop_code: '212', crop_name: '배추',   unit: '10kg', basePrice: 12000 },
  { crop_code: '213', crop_name: '무',     unit: '20kg', basePrice: 8500  },
  { crop_code: '214', crop_name: '양파',   unit: '20kg', basePrice: 18000 },
  { crop_code: '215', crop_name: '마늘',   unit: '10kg', basePrice: 35000 },
  { crop_code: '216', crop_name: '대파',   unit: '1kg',  basePrice: 2800  },
  { crop_code: '311', crop_name: '사과',   unit: '10kg', basePrice: 52000 },
  { crop_code: '312', crop_name: '배',     unit: '15kg', basePrice: 48000 },
  { crop_code: '313', crop_name: '포도',   unit: '5kg',  basePrice: 28000 },
  { crop_code: '411', crop_name: '감자',   unit: '20kg', basePrice: 22000 },
  { crop_code: '412', crop_name: '고구마', unit: '10kg', basePrice: 19000 },
  { crop_code: '511', crop_name: '옥수수', unit: '10개', basePrice: 8000  },
];

if (!globalThis._farmPrices) {
  globalThis._farmPrices = Object.fromEntries(
    CROP_INFO.map(c => [c.crop_code, c.basePrice])
  );
  globalThis._farmPrevPrices = { ...globalThis._farmPrices };
  globalThis._farmLastUpdate = 0;
}

function updatePrices() {
  const now = Date.now();
  if (now - globalThis._farmLastUpdate < 3000) return;
  globalThis._farmLastUpdate = now;
  globalThis._farmPrevPrices = { ...globalThis._farmPrices };
  for (const code of Object.keys(globalThis._farmPrices)) {
    const prev = globalThis._farmPrices[code];
    const change = (Math.random() * 4 - 2) / 100;
    globalThis._farmPrices[code] = Math.round(prev * (1 + change));
  }
}

export async function GET(request) {
  updatePrices();

  const prices = CROP_INFO.map(item => ({
    crop_code:  item.crop_code,
    crop_name:  item.crop_name,
    unit:       item.unit,
    price:      String(globalThis._farmPrices[item.crop_code]),
    diff:       globalThis._farmPrices[item.crop_code] - globalThis._farmPrevPrices[item.crop_code],
  }));

  const user = getUser(request);
  if (user) {
    try {
      const [conditions] = await pool.execute(
        'SELECT * FROM alert_conditions WHERE user_id = ? AND is_active = 1',
        [user.id]
      );
      for (const condition of conditions) {
        const current   = globalThis._farmPrices[condition.crop_code];
        if (!current) continue;
        const threshold = Number(condition.threshold_price);
        const triggered =
          (condition.condition_type === 'below' && current <= threshold) ||
          (condition.condition_type === 'above' && current >= threshold);
        if (triggered) {
          const [recent] = await pool.execute(
            'SELECT id FROM notifications WHERE user_id = ? AND condition_id IN (SELECT id FROM alert_conditions WHERE crop_code = ? AND user_id = ?) AND DATE(created_at) = CURDATE()',
            [user.id, condition.crop_code, user.id]
          );
          if (recent.length === 0) {
            const direction = condition.condition_type === 'below' ? '이하' : '이상';
            await pool.execute(
              'INSERT INTO notifications (user_id, condition_id, message, current_price) VALUES (?, ?, ?, ?)',
              [user.id, condition.id, `${condition.crop_name} 현재가 ${current.toLocaleString()}원 — 설정 기준가 ${threshold.toLocaleString()}원 ${direction}`, current]
            );
          }
        }
      }
    } catch (err) {
      console.error('알림 체크 오류:', err);
    }
  }

  return NextResponse.json({ prices });
}
