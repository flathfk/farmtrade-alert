
'use client';

import { useQuery } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

async function fetchPrices() {
  const res = await fetch('/api/prices');
  const data = await res.json();
  return data.prices ?? [];
}

async function fetchNotifications(token) {
  const res = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.notifications ?? [];
}

export default function DashboardPage() {
  const { token, setUnreadCount } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  const { data: prices = [] } = useQuery({
    queryKey: ['prices'],
    queryFn: fetchPrices,
    refetchInterval: 30000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(token),
    enabled: !!token,
    refetchInterval: 30000,
    onSuccess: (data) => {
      setUnreadCount(data.filter(n => !n.is_read).length);
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">대시보드</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">실시간 농산물 가격 (30초마다 갱신)</h2>
        {prices.length === 0 ? (
          <p className="text-gray-400">가격 정보를 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {prices.slice(0, 12).map((item, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500">{item.crop_name}</p>
                <p className="text-lg font-bold text-green-700">{Number(item.price).toLocaleString()}원</p>
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
              <div key={n.id} className={`p-4 rounded-lg border ${n.is_read ? 'bg-gray-50' : 'bg-yellow-50 border-yellow-200'}`}>
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
