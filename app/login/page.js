
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/useAuthStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    login(data.token, data.username);
    router.push('/dashboard');
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-green-800 mb-6">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800">
          로그인
        </button>
        <p className="text-center text-sm text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-green-700 font-semibold hover:underline">회원가입</Link>
        </p>
      </form>
    </div>
  );
}
