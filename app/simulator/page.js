'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const ASSET_CODES = [
  { id: '511', name: '옥수수', emoji: '🌽' },
  { id: '111', name: '쌀',    emoji: '🌾' },
  { id: '214', name: '양파',  emoji: '🧅' },
  { id: '212', name: '배추',  emoji: '🥬' },
];

export default function SimulatorPage() {
  const { token, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedAsset, setSelectedAsset] = useState('511');
  const [direction, setDirection] = useState('long');
  const [leverage, setLeverage] = useState(2);
  const [margin, setMargin] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const entryPriceRef = useRef(null);

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [token, _hasHydrated]);

  // 대시보드랑 같은 prices 데이터 사용 (5초 폴링)
  const { data: priceData = [] } = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      const res = await fetch('/api/prices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.prices ?? [];
    },
    enabled: !!token,
    refetchInterval: 5000,
  });

  const pricesMap = Object.fromEntries(
    priceData.map(p => [p.crop_code, Number(p.price)])
  );

  const { data } = useQuery({
    queryKey: ['simulator'],
    queryFn: async () => {
      const res = await fetch('/api/simulator', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!token,
  });

  const balance = data?.balance ?? 10000000;
  const trades  = data?.trades  ?? [];

  const tradeMutation = useMutation({
    mutationFn: async (tradeData) => {
      await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(tradeData),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['simulator'] }),
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      await fetch('/api/simulator/reset', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['simulator'] }); setResult(null); },
  });

  function executeTrade() {
    const m = parseInt(margin);
    if (!m || m <= 0 || m > balance) return;

    const entryPrice = pricesMap[selectedAsset];
    if (!entryPrice) return;
    entryPriceRef.current = entryPrice;

    const assetId = selectedAsset;
    const dir = direction;
    const lev = leverage;
    const fee = Math.round(m * 0.001);
    setPending(true);

    setTimeout(() => {
      // 5초 후 현재 가격 (React Query 캐시에서)
      const cachedPrices = queryClient.getQueryData(['prices']) ?? [];
      const exitItem = cachedPrices.find(p => p.crop_code === assetId);
      const exitPrice = exitItem ? Number(exitItem.price) : entryPriceRef.current;

      const changeRate = (exitPrice - entryPriceRef.current) / entryPriceRef.current;
      const rawPnl = dir === 'long'
        ? Math.round(m * lev * changeRate)
        : Math.round(m * lev * -changeRate);
      const pnl = Math.max(rawPnl, -m);
      const balance_after = balance - fee + pnl;
      const asset = ASSET_CODES.find(a => a.id === assetId);
      const tradeData = {
        asset: asset.emoji + ' ' + asset.name,
        direction: dir, leverage: lev, margin: m, fee, pnl, balance_after,
      };
      setResult(tradeData);
      setPending(false);
      tradeMutation.mutate(tradeData);
    }, 5000);
  }

  if (!_hasHydrated) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1a3a2a]">선물 거래 시뮬레이터</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-green-700">잔고: {balance.toLocaleString()}원</span>
          <button onClick={() => resetMutation.mutate()}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg">
            초기화
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">실시간 가격 (5초 변동)</h2>
          <div className="grid grid-cols-2 gap-3">
            {ASSET_CODES.map(asset => (
              <div key={asset.id} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">{asset.emoji} {asset.name}</p>
                <p className="text-lg font-bold text-[#1a3a2a]">
                  {pricesMap[asset.id] ? pricesMap[asset.id].toLocaleString() : '-'}원
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">거래 설정</h2>
          <div className="space-y-3">
            <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              {ASSET_CODES.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
            </select>

            <div className="flex gap-2">
              <button onClick={() => setDirection('long')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${direction === 'long' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                ▲ 롱 (상승)
              </button>
              <button onClick={() => setDirection('short')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${direction === 'short' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                ▼ 숏 (하락)
              </button>
            </div>

            <select value={leverage} onChange={e => setLeverage(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              {[1,2,3,5,10].map(l => <option key={l} value={l}>{l}x 레버리지</option>)}
            </select>

            <div>
              <input type="number" placeholder="마진 입력 (원)" value={margin} onChange={e => setMargin(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-2" />
              <div className="flex gap-2">
                {[25, 50, 75, 100].map(pct => (
                  <button key={pct} onClick={() => setMargin(String(Math.floor(balance * pct / 100)))}
                    className="flex-1 py-1.5 text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors font-medium">
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <button onClick={executeTrade} disabled={pending}
              className="w-full bg-[#1a3a2a] text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition-colors disabled:opacity-50">
              {pending ? '거래 진행 중... (5초)' : '거래 실행'}
            </button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-xl ${result.pnl >= 0 ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              <p className="text-sm font-semibold">
                {result.pnl >= 0 ? '✅ 수익' : '❌ 손실'}: {result.pnl >= 0 ? '+' : ''}{result.pnl.toLocaleString()}원
              </p>
              <p className="text-xs text-gray-500 mt-1">수수료: {result.fee.toLocaleString()}원</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-4">거래 내역</h2>
        {trades.length === 0 ? (
          <p className="text-gray-400 text-sm">거래 내역이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {trades.map((t, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-sm">
                <div>
                  <span className="font-medium">{t.asset}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${t.direction === 'long' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {t.direction === 'long' ? '▲ 롱' : '▼ 숏'} {t.leverage}x
                  </span>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${t.pnl >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                    {t.pnl >= 0 ? '+' : ''}{Number(t.pnl).toLocaleString()}원
                  </p>
                  <p className="text-xs text-gray-400">{Number(t.balance_after).toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
