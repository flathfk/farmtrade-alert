
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';

export default function NewAlertPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [cropCode, setCropCode] = useState('');
  const [cropName, setCropName] = useState('');
  const [threshold, setThreshold] = useState('');
  const [conditionType, setConditionType] = useState('below');
  const [error, setError] = useState('');

  const { data: prices = [] } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch('/api/prices');
      const data = await res.json();
      return data.prices ?? [];
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ crop_code: cropCode, crop_name: cropName, threshold_price: threshold, condition_type: conditionType }),
    });
    if (!res.ok) return setError('등록 실패');
    router.push('/alerts');
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">알림 조건 추가</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select value={cropCode} onChange={e => {
          const selected = prices.find(p => p.crop_code === e.target.value);
          setCropCode(e.target.value);
          setCropName(selected?.crop_name ?? '');
        }} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">품목 선택</option>
          {prices.map((p, i) => (
            <option key={i} value={p.crop_code}>{p.crop_name}</option>
          ))}
        </select>
        <select value={conditionType} onChange={e => setConditionType(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="below">이하일 때 알림</option>
          <option value="above">이상일 때 알림</option>
        </select>
        <input type="number" placeholder="기준 가격 (원)" value={threshold} onChange={e => setThreshold(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800">
          등록
        </button>
      </form>
    </div>
  );
}
