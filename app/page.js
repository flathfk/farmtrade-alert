'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

const PREVIEW_PRICES = [
  { crop_name: '쌀',    unit: '20kg', price: '45000', diff: 500  },
  { crop_name: '배추',  unit: '10kg', price: '12000', diff: -1000 },
  { crop_name: '양파',  unit: '20kg', price: '18000', diff: 500  },
  { crop_name: '마늘',  unit: '10kg', price: '35000', diff: -1000 },
  { crop_name: '사과',  unit: '10kg', price: '52000', diff: 1000  },
  { crop_name: '감자',  unit: '20kg', price: '22000', diff: 1000  },
  { crop_name: '고구마',unit: '10kg', price: '19000', diff: -500  },
  { crop_name: '옥수수',unit: '10개', price: '8000',  diff: 200  },
];

export default function Home() {
  const { token, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // 로그인 상태에서 메인 접근 시 대시보드로 이동
  useEffect(() => {
    if (_hasHydrated && token) router.push('/dashboard');
  }, [token, _hasHydrated]);

  if (!_hasHydrated) return null;
  if (token) return null;

  return (
    <div>
      <div className="text-center py-16 bg-gradient-to-b from-green-50 to-white rounded-2xl mb-10">
        <div className="text-5xl mb-4">🌾</div>
        <h1 className="text-4xl font-bold text-[#1a3a2a] mb-3">FarmTrade Alert</h1>
        <p className="text-gray-500 text-lg mb-2">농산물 실시간 도매가 모니터링 및 가격 알림 서비스</p>
        <p className="text-gray-400 text-sm mb-8">KAMIS 도매가 기반 · 조건별 알림 · 선물 거래 시뮬레이터</p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-[#1a3a2a] text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors">
            회원가입
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">이미 계정이 있으신가요? <Link href="/login" className="text-green-700 font-semibold hover:underline">로그인</Link></p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">오늘의 주요 농산물 도매가</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PREVIEW_PRICES.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{item.unit}</p>
              <p className="text-sm font-semibold text-gray-700">{item.crop_name}</p>
              <p className="text-xl font-bold text-[#1a3a2a] mt-1">{Number(item.price).toLocaleString()}원</p>
              <p className={`text-xs mt-1 font-medium ${item.diff > 0 ? 'text-red-500' : item.diff < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                {item.diff > 0 ? `▲ ${item.diff.toLocaleString()}` : item.diff < 0 ? `▼ ${Math.abs(item.diff).toLocaleString()}` : '변동없음'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-green-50 rounded-xl">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-bold text-gray-800 mb-1">실시간 가격 모니터링</h3>
          <p className="text-sm text-gray-500">KAMIS 도매가 기반 실시간 가격 조회</p>
        </div>
        <div className="p-6 bg-green-50 rounded-xl">
          <div className="text-3xl mb-2">🔔</div>
          <h3 className="font-bold text-gray-800 mb-1">조건별 알림 설정</h3>
          <p className="text-sm text-gray-500">원하는 가격 조건 등록 후 자동 알림</p>
        </div>
        <div className="p-6 bg-green-50 rounded-xl">
          <div className="text-3xl mb-2">📈</div>
          <h3 className="font-bold text-gray-800 mb-1">선물 거래 시뮬레이터</h3>
          <p className="text-sm text-gray-500">실제 도매가로 선물 거래를 체험해보세요</p>
        </div>
      </div>
    </div>
  );
}
