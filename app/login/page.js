
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('saved_email');
    if (saved) { setEmail(saved); setRememberEmail(true); }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    if (rememberEmail) localStorage.setItem('saved_email', email);
    else localStorage.removeItem('saved_email');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    login(data.token, data.username);
    router.push('/dashboard');
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#1a3a2a] mb-2">로그인</h1>
        <p className="text-gray-400 text-sm mb-6">FarmTrade Alert에 오신 것을 환영합니다</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">이메일</label>
            <input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">비밀번호</label>
            <input type="password" placeholder="비밀번호 입력" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={rememberEmail} onChange={e => setRememberEmail(e.target.checked)} className="w-4 h-4 accent-green-600" />
            이메일 저장
          </label>
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1a3a2a] text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-50">
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <p className="text-center text-sm text-gray-500">
            계정이 없으신가요?{' '}
            <Link href="/register" className="text-green-700 font-semibold hover:underline">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
