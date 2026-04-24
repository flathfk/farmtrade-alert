// ═══════════════════════════════════════════════════════
// app/providers.js  —  전역 Provider 래퍼
//
// QueryClient 설정:
//   refetchInterval: 5000 → 모든 쿼리 5초마다 자동 갱신
//   staleTime 없음 → invalidateQueries 후 즉시 리페치
// ═══════════════════════════════════════════════════════
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { refetchInterval: 5000 },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
