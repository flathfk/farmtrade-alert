'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

export default function Header() {
  const { token, username, unreadCount, logout } = useAuthStore();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard',     label: '대시보드' },
    { href: '/alerts',        label: '알림 조건' },
    { href: '/news',          label: '뉴스' },
    { href: '/simulator',     label: '시뮬레이터' },
    { href: '/notifications', label: '알림', badge: true },
  ];

  return (
    <header className="bg-[#1a3a2a] text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 flex justify-between items-stretch">
        <Link href="/" className="flex items-center gap-2 py-4 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          🌾 <span>FarmTrade Alert</span>
        </Link>
        <nav className="flex items-stretch gap-0.5 text-sm">
          {token ? (
            <>
              {navItems.map(item => (
                <Link key={item.href} href={item.href}
                  className={`relative flex items-center px-4 transition-colors hover:bg-white/10
                    ${pathname === item.href
                      ? 'border-b-2 border-green-400 text-green-300 font-medium'
                      : 'text-gray-200'}`}>
                  {item.label}
                  {item.badge && unreadCount > 0 && (
                    <span className="absolute top-3 right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              <Link href="/mypage"
                className={`flex items-center px-4 transition-colors hover:bg-white/10
                  ${pathname === '/mypage' ? 'border-b-2 border-green-400 text-green-300 font-medium' : 'text-green-300 font-semibold'}`}>
                {username}
              </Link>
              <div className="flex items-center pl-2">
                <button onClick={logout}
                  className="my-3 px-4 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg transition-colors text-sm font-medium">
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center px-4 text-gray-200 hover:bg-white/10 transition-colors">로그인</Link>
              <div className="flex items-center pl-2">
                <Link href="/register" className="my-3 px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-medium">회원가입</Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
