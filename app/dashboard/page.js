'use client';

import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { token, setUnreadCount, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [token, _hasHydrated]);

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
    refetchInterval: 5000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.notifications ?? [];
      // unreadCount는 여기서만 세팅
      setUnreadCount(list.filter(n => !n.is_read).length);
      return list;
    },
    enabled: !!token,
    refetchInterval: 5000,
  });

  if (!_hasHydrated) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a3a2a] mb-6">대시보드</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">실시간 농산물 가격 (5초마다 갱신)</h2>
        {prices.length === 0 ? (
          <p className="text-gray-400">가격 정보를 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {prices.map((item, i) => (
              <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-500">{item.crop_name}</p>
                <p className="text-lg font-bold text-[#1a3a2a]">{Number(item.price).toLocaleString()}원</p>
                <p className="text-xs text-gray-400">{item.unit}</p>
                <p className={`text-xs mt-1 ${item.diff > 0 ? 'text-red-500' : item.diff < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                  {item.diff > 0 ? `▲ ${item.diff}` : item.diff < 0 ? `▼ ${Math.abs(item.diff)}` : '-'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">최근 알림</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-400">알림이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`p-4 rounded-xl border ${n.is_read ? 'bg-gray-50 border-gray-100' : 'bg-yellow-50 border-yellow-200'}`}>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
