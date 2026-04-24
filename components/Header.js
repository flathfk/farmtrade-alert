
'use client';

import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

export default function Header() {
  const { token, username, unreadCount, logout } = useAuthStore();

  return (
    <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">🌾 FarmTrade Alert</Link>
      <nav className="flex gap-4 items-center text-sm">
        {token ? (
          <>
            <Link href="/dashboard">대시보드</Link>
            <Link href="/alerts">알림 조건</Link>
            <Link href="/notifications" className="relative">
              알림
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <span className="text-green-300">{username}</span>
            <button onClick={logout} className="bg-green-600 px-3 py-1 rounded">로그아웃</button>
          </>
        ) : (
          <>
            <Link href="/login">로그인</Link>
            <Link href="/register" className="bg-green-600 px-3 py-1 rounded">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
