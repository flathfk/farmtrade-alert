export default function Footer() {
  return (
    <footer className="bg-[#1a3a2a] text-gray-300 mt-16">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">🌾 FarmTrade Alert</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              농산물 실시간 도매가 모니터링 및<br/>가격 알림 서비스
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">서비스</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>실시간 가격 모니터링</li>
              <li>조건별 알림 설정</li>
              <li>농산물 뉴스</li>
              <li>선물 거래 시뮬레이터</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">운영 기관</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>한경아카데미 (3층)</li>
              <li>서울특별시 중구 중림동 441</li>
              <li>한국경제TV</li>
              <li>Tel. 02-360-4882</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex justify-between items-center text-xs text-gray-500">
          <p>© 2026 FarmTrade Alert. Developed by 임소라.</p>
          <p>한경×토스뱅크 FullStack-LLM 부트캠프</p>
        </div>
      </div>
    </footer>
  );
}
