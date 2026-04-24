
import Link from 'next/link';

async function getPrices() {
  try {
    const res = await fetch(`http://localhost:3000/api/prices`, { cache: 'no-store' });
    const data = await res.json();
    return data.prices ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const prices = await getPrices();

  return (
    <div>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-green-800 mb-4">🌾 FarmTrade Alert</h1>
        <p className="text-gray-600 text-lg mb-8">농산물 실시간 가격 모니터링 및 알림 서비스</p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800">
            시작하기
          </Link>
          <Link href="/login" className="border border-green-700 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50">
            로그인
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">오늘의 주요 농산물 가격</h2>
        {prices.length === 0 ? (
          <p className="text-gray-400">가격 정보를 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {prices.slice(0, 8).map((item, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-500">{item.crop_name}</p>
                <p className="text-lg font-bold text-green-700">{Number(item.price).toLocaleString()}원</p>
                <p className="text-xs text-gray-400">{item.unit}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
