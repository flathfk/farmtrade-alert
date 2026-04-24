
import { Geist } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Header from '@/components/Header';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'FarmTrade Alert',
  description: '농산물 가격 모니터링 및 알림 서비스',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={geist.className}>
        <Providers>
          <Header />
          <main className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
