// ═══════════════════════════════════════════════════════
// /alerts/new  —  알림 조건 등록 페이지
//
// /api/prices에서 품목 목록을 가져와 select box 구성
// 조건 등록 후 /alerts로 리다이렉트
// ═══════════════════════════════════════════════════════
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';

export default function NewAlertPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [cropCode, setCropCode]       = useState('');
  const [cropName, setCropName]       = useState('');
  const [threshold, setThreshold]     = useState('');
  const [conditionType, setConditionType] = useState('below');
  const [error, setError]             = useState('');

  // 품목 목록을 가격 API에서 가져옴
  const { data: prices = [] } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch('/api/prices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.prices ?? [];
    },
    enabled: !!token,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        crop_code: cropCode,
        crop_name: cropName,
        threshold_price: threshold,
        condition_type: conditionType,
      }),
    });
    if (!res.ok) return setError('등록 실패');
    router.push('/alerts');
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-[#1a3a2a] mb-6">알림 조건 추가</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">품목 선택</label>
            <select value={cropCode} onChange={e => {
              const selected = prices.find(p => p.crop_code === e.target.value);
              setCropCode(e.target.value);
              setCropName(selected?.crop_name ?? '');
            }} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">품목을 선택하세요</option>
              {prices.map((p, i) => (
                <option key={i} value={p.crop_code}>{p.crop_name} ({p.unit})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">알림 조건</label>
            <select value={conditionType} onChange={e => setConditionType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="below">이하일 때 알림 (가격 하락)</option>
              <option value="above">이상일 때 알림 (가격 상승)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">기준 가격 (원)</label>
            <input type="number" placeholder="예: 45000" value={threshold} onChange={e => setThreshold(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit"
            className="w-full bg-[#1a3a2a] text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors">
            등록
          </button>
        </form>
      </div>
    </div>
  );
}
