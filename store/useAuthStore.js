// ═══════════════════════════════════════════════════════
// store/useAuthStore.js  —  전역 인증 상태 관리 (Zustand + persist)
//
// persist 미들웨어:
//   localStorage에 token/username 저장 → 새로고침해도 로그인 유지
//
// _hasHydrated 플래그:
//   SSR 환경에서는 localStorage 접근 불가 → token이 null로 시작
//   hydration 완료 전에 /login으로 리다이렉트되는 버그 방지
//   _hasHydrated가 true가 된 후에만 인증 상태 체크
//
// unreadCount:
//   헤더 알림 아이콘 뱃지 숫자
//   /api/notifications 폴링 때마다 갱신
// ═══════════════════════════════════════════════════════
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token:        null,
      username:     null,
      unreadCount:  0,
      _hasHydrated: false,

      // 로그인 성공 시 token + username 저장
      login:          (token, username) => set({ token, username }),

      // 로그아웃 시 전체 초기화
      logout:         () => set({ token: null, username: null, unreadCount: 0 }),

      // 읽지 않은 알림 수 갱신
      setUnreadCount: (count) => set({ unreadCount: count }),

      // localStorage 복원 완료 플래그
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // localStorage 복원 완료 시 _hasHydrated = true
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
