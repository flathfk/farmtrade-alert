import { Geist } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'FarmTrade Alert',
  description: '농산물 실시간 도매가 모니터링 및 가격 알림 서비스',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={geist.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
