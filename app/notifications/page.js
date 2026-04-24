'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { token, setUnreadCount, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasMarkedRead = useRef(false);

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [token, _hasHydrated]);

  // 알림 목록 조회
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.notifications ?? [];
    },
    enabled: !!token,
  });

  // 페이지 진입 시 1회 전체 읽음 처리 + 캐시 즉시 업데이트
  useEffect(() => {
    if (!token || hasMarkedRead.current) return;
    hasMarkedRead.current = true;

    fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setUnreadCount(0);
      queryClient.setQueryData(['notifications'], (old) => {
        if (!old) return old;
        return old.map(n => ({ ...n, is_read: 1 }));
      });
    });
  }, [token]);

  if (!_hasHydrated) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1a3a2a] mb-6">알림 내역</h1>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500">알림이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-3 ${n.is_read ? 'bg-white border-gray-100' : 'bg-yellow-50 border-yellow-200'}`}>
              <span className="text-lg mt-0.5">🔔</span>
              <div>
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && <span className="ml-auto text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full font-medium self-start">NEW</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
