'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 품목 코드별 이모지 매핑
const CROP_EMOJI = {
  '111': '🌾', '212': '🥬', '213': '🥕', '214': '🧅',
  '215': '🧄', '216': '🌿', '311': '🍎', '312': '🍐',
  '313': '🍇', '411': '🥔', '412': '🍠', '511': '🌽',
};

export default function AlertsPage() {
  const { token, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [token, _hasHydrated]);

  // 내 알림 조건 목록 조회
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alerts', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      return data.alerts ?? [];
    },
    enabled: !!token,
  });

  // 알림 조건 삭제
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  if (!_hasHydrated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a3a2a]">알림 조건 관리</h1>
        <Link href="/alerts/new" className="bg-[#1a3a2a] text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition-colors">
          + 조건 추가
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500 mb-4">등록된 알림 조건이 없습니다</p>
          <Link href="/alerts/new" className="bg-[#1a3a2a] text-white px-6 py-2 rounded-lg text-sm hover:bg-green-800 transition-colors">
            첫 번째 조건 등록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white border border-gray-100 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{CROP_EMOJI[alert.crop_code] ?? '🌱'}</span>
                <div>
                  <p className="font-semibold text-gray-800">{alert.crop_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    <span className={`font-medium ${alert.condition_type === 'above' ? 'text-red-500' : 'text-blue-500'}`}>
                      {Number(alert.threshold_price).toLocaleString()}원 {alert.condition_type === 'below' ? '이하' : '이상'}
                    </span>
                    {' '}일 때 알림
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${alert.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {alert.is_active ? '활성' : '비활성'}
                </span>
                <button onClick={() => deleteMutation.mutate(alert.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
