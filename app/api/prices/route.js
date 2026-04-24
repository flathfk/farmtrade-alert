
import { NextResponse } from 'next/server';

const MOCK_PRICES = [
  { crop_code: '111', crop_name: '쌀', unit: '20kg', price: '45000', prev_price: '44500' },
  { crop_code: '212', crop_name: '배추', unit: '10kg', price: '12000', prev_price: '13000' },
  { crop_code: '213', crop_name: '무', unit: '20kg', price: '8500', prev_price: '8200' },
  { crop_code: '214', crop_name: '양파', unit: '20kg', price: '18000', prev_price: '17500' },
  { crop_code: '215', crop_name: '마늘', unit: '10kg', price: '35000', prev_price: '36000' },
  { crop_code: '216', crop_name: '대파', unit: '1kg', price: '2800', prev_price: '2600' },
  { crop_code: '311', crop_name: '사과', unit: '10kg', price: '52000', prev_price: '51000' },
  { crop_code: '312', crop_name: '배', unit: '15kg', price: '48000', prev_price: '49000' },
  { crop_code: '313', crop_name: '포도', unit: '5kg', price: '28000', prev_price: '27500' },
  { crop_code: '411', crop_name: '감자', unit: '20kg', price: '22000', prev_price: '21000' },
  { crop_code: '412', crop_name: '고구마', unit: '10kg', price: '19000', prev_price: '19500' },
  { crop_code: '511', crop_name: '옥수수', unit: '10개', price: '8000', prev_price: '7800' },
];

export async function GET() {
  const prices = MOCK_PRICES.map(item => ({
    ...item,
    diff: Number(item.price) - Number(item.prev_price),
  }));
  return NextResponse.json({ prices });
}
