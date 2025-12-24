import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '最強管理者権限争奪戦 - モデレーターバトロワルーレット',
  description: '参加者の「枠数」に基づいた確率的なルーレット対戦で、公平で楽しいトーナメント形式のイベントを運営',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-cyber-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}

