// ═══════════════════════════════════════════════════════
// /mypage  —  마이페이지
//
// 기능:
//   1. 계정 정보 표시 (아이디)
//   2. 비밀번호 변경 (현재 비번 확인 후 변경)
//   3. 회원 탈퇴 (confirm 후 DELETE → 로그아웃 → 메인으로)
// ═══════════════════════════════════════════════════════
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';

export default function MyPage() {
  const { token, username, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [error, setError]                       = useState('');
  const [success, setSuccess]                   = useState('');
  const [loading, setLoading]                   = useState(false);

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [token, _hasHydrated]);

  async function handlePasswordChange(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPassword !== confirmPassword) return setError('새 비밀번호가 일치하지 않습니다');
    if (newPassword.length < 6) return setError('비밀번호는 6자 이상이어야 합니다');
    setLoading(true);
    const res = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    setSuccess('비밀번호가 변경되었습니다');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  }

  function handleDeleteAccount() {
    if (!confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    fetch('/api/auth/delete', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => { logout(); router.push('/'); });
  }

  if (!_hasHydrated) return null;

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h1 className="text-2xl font-bold text-[#1a3a2a] mb-6">마이페이지</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-800 mb-4">계정 정보</h2>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-500">아이디</span>
          <span className="text-sm font-medium text-gray-800">{username}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h2 className="text-base font-semibold text-gray-800 mb-4">비밀번호 변경</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">현재 비밀번호</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">새 비밀번호</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">새 비밀번호 확인</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {error   && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">{success}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#1a3a2a] text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-50">
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
        <h2 className="text-base font-semibold text-red-600 mb-2">위험 구역</h2>
        <p className="text-sm text-gray-500 mb-4">계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.</p>
        <button onClick={handleDeleteAccount}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
