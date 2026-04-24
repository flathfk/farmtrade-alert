
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AlertsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch('/api/alerts', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      return data.alerts ?? [];
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['alerts']),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">알림 조건 관리</h1>
        <Link href="/alerts/new" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">
          + 조건 추가
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="text-gray-400">등록된 알림 조건이 없습니다</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white border rounded-lg p-4 flex justify-between items-center shadow-sm">
              <div>
                <p className="font-semibold text-gray-800">{alert.crop_name}</p>
                <p className="text-sm text-gray-500">
                  {alert.condition_type === 'below' ? '이하' : '이상'} {Number(alert.threshold_price).toLocaleString()}원
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${alert.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {alert.is_active ? '활성' : '비활성'}
                </span>
              </div>
              <button onClick={() => deleteMutation.mutate(alert.id)}
                className="text-red-400 hover:text-red-600 text-sm">
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
