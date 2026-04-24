
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { token, setUnreadCount } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUnreadCount(data.notifications?.filter(n => !n.is_read).length ?? 0);
      return data.notifications ?? [];
    },
    enabled: !!token,
  });

  const readMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 mb-6">알림 내역</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-400">알림이 없습니다</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 rounded-lg border flex justify-between items-start ${n.is_read ? 'bg-gray-50' : 'bg-yellow-50 border-yellow-200'}`}>
              <div>
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => readMutation.mutate(n.id)}
                  className="text-xs text-green-600 hover:text-green-800 ml-4 whitespace-nowrap">
                  읽음
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
