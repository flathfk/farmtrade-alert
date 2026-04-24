'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'corn',    name: '옥수수', emoji: '🌽' },
  { id: 'wheat',   name: '밀',    emoji: '🌾' },
  { id: 'soybean', name: '대두',  emoji: '🫘' },
  { id: 'cabbage', name: '배추',  emoji: '🥬' },
  { id: 'apple',   name: '사과',  emoji: '🍎' },
  { id: 'onion',   name: '양파',  emoji: '🧅' },
];

export default function NewsPage() {
  const { token, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState(null); // null = 내 구독만
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [token, _hasHydrated]);

  const { data: newsData } = useQuery({
    queryKey: ['news', selectedCategory],
    queryFn: async () => {
      const url = selectedCategory
        ? `/api/news?category=${selectedCategory}`
        : '/api/news';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const { data: subData } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions', { headers: { Authorization: `Bearer ${token}` } });
      return res.json();
    },
    enabled: !!token,
  });

  const allNews       = newsData?.news ?? [];
  const subscriptions = subData?.subscriptions ?? [];

  // 구독 필터: showAll이면 전체, 아니면 구독 카테고리만
  const filteredNews = showAll || selectedCategory
    ? allNews
    : allNews.filter(n => subscriptions.includes(n.category));

  const subscribeMutation = useMutation({
    mutationFn: async (category) => {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (category) => {
      await fetch(`/api/subscriptions/${category}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  });

  if (!_hasHydrated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a3a2a]">농산물 뉴스</h1>
        <button onClick={() => { setShowAll(!showAll); setSelectedCategory(null); }}
          className={`text-sm px-4 py-2 rounded-xl transition-colors ${showAll ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}`}>
          {showAll ? '전체 보기 중' : '내 구독만 보기'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => {
          const isSubscribed = subscriptions.includes(cat.id);
          const isSelected   = selectedCategory === cat.id;
          return (
            <div key={cat.id} className="flex items-center gap-1">
              <button onClick={() => { setSelectedCategory(isSelected ? null : cat.id); setShowAll(false); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isSelected ? 'bg-[#1a3a2a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat.emoji} {cat.name}
              </button>
              <button
                onClick={() => isSubscribed ? unsubscribeMutation.mutate(cat.id) : subscribeMutation.mutate(cat.id)}
                className={`text-xs px-2 py-1 rounded-lg transition-colors ${isSubscribed ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                {isSubscribed ? '구독중' : '구독'}
              </button>
            </div>
          );
        })}
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📰</p>
          <p>{subscriptions.length === 0 ? '구독한 카테고리가 없습니다. 위에서 구독해보세요.' : '뉴스가 없습니다'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNews.map(item => {
            const cat = CATEGORIES.find(c => c.id === item.category);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {cat?.emoji} {cat?.name ?? item.category}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
