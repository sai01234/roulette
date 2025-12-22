'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // セッションチェック
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.isLoggedIn) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <main className="min-h-screen cyber-grid-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* ロゴアニメーション */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-6"
        >
          <svg viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#loading-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="60 200"
            />
            <defs>
              <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff3366" />
                <stop offset="100%" stopColor="#00ffcc" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* タイトル */}
        <h1 className="font-display text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-cyber-accent via-cyber-purple to-cyber-accent2 bg-clip-text text-transparent">
            モデレーターバトロワルーレット
          </span>
        </h1>
        <p className="font-body text-gray-400">読み込み中...</p>
      </motion.div>
    </main>
  );
}
