'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament } from '@/lib/types';
import TournamentCard from '@/components/TournamentCard';

export default function DashboardPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // トーナメント取得
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tournaments');

      if (!response.ok) {
        throw new Error('トーナメントの取得に失敗しました');
      }

      const data = await response.json();
      console.log('API Response:', data); // デバッグログ

      // データが配列であることを確認
      if (Array.isArray(data.tournaments)) {
        setTournaments(data.tournaments);
      } else {
        console.error('Invalid tournaments data:', data);
        setTournaments([]);
      }
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error('Fetch error:', err);
      setTournaments([]); // エラー時は空配列を設定
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 検索フィルタリング
  const filteredTournaments = Array.isArray(tournaments)
    ? tournaments.filter(tournament =>
        tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const completedCount = Array.isArray(tournaments)
    ? tournaments.filter(t => t?.completedAt !== null).length
    : 0;
  const ongoingCount = Array.isArray(tournaments)
    ? tournaments.length - completedCount
    : 0;

  return (
    <main className="min-h-screen cyber-grid-bg">
      {/* ヘッダー */}
      <header className="header-gradient border-b border-cyber-accent/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyber-accent via-cyber-purple to-cyber-accent2 bg-clip-text text-transparent">
                  トーナメント管理
                </span>
              </h1>
              <p className="font-body text-sm text-gray-400 mt-1">
                モデレーターバトロワルーレット
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="
                px-4 py-2 rounded-lg font-body text-sm
                bg-cyber-card border border-cyber-accent/30
                text-gray-300 hover:text-white
                hover:border-cyber-accent/60
                transition-all
              "
            >
              ログアウト
            </motion.button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 統計カード */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="panel p-6">
            <p className="text-sm text-gray-400 font-body mb-2">総トーナメント数</p>
            <p className="text-4xl font-display font-bold text-cyber-accent">
              {Array.isArray(tournaments) ? tournaments.length : 0}
            </p>
          </div>

          <div className="panel p-6">
            <p className="text-sm text-gray-400 font-body mb-2">進行中</p>
            <p className="text-4xl font-display font-bold text-yellow-400">
              {ongoingCount}
            </p>
          </div>

          <div className="panel p-6">
            <p className="text-sm text-gray-400 font-body mb-2">完了</p>
            <p className="text-4xl font-display font-bold text-green-400">
              {completedCount}
            </p>
          </div>
        </motion.div>

        {/* 検索バーと新規作成ボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* 検索バー */}
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="トーナメント名で検索..."
              className="
                w-full px-4 py-3 rounded-lg
                bg-cyber-card border-2 border-cyber-accent/20
                text-white font-body
                focus:outline-none focus:border-cyber-accent
                transition-colors
              "
            />
          </div>

          {/* 新規作成ボタン */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/tournament/new')}
            className="
              px-6 py-3 rounded-lg font-display font-bold
              bg-gradient-to-r from-cyber-accent to-cyber-accent2
              hover:from-cyber-accent/90 hover:to-cyber-accent2/90
              text-white shadow-lg shadow-cyber-accent/20
              transition-all
            "
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新規トーナメント
            </div>
          </motion.button>
        </motion.div>

        {/* トーナメント一覧 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mb-4"
            >
              <svg viewBox="0 0 100 100" fill="none">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#spinner-gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="60 200"
                />
                <defs>
                  <linearGradient id="spinner-gradient">
                    <stop offset="0%" stopColor="#ff3366" />
                    <stop offset="100%" stopColor="#00ffcc" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <p className="font-body text-gray-400">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="panel p-8 text-center">
            <p className="text-red-400 font-body">{error}</p>
            <button
              onClick={fetchTournaments}
              className="mt-4 px-6 py-2 rounded-lg bg-cyber-accent text-white font-body"
            >
              再試行
            </button>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="panel p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 opacity-20">
              <svg viewBox="0 0 100 100" fill="currentColor" className="text-gray-500">
                <circle cx="50" cy="50" r="40" opacity="0.3" />
                <path d="M30 50 L50 30 L70 50 L50 70 Z" />
              </svg>
            </div>
            <p className="font-display text-xl text-gray-500 mb-2">
              {searchQuery ? '検索結果がありません' : 'トーナメントがありません'}
            </p>
            <p className="font-body text-sm text-gray-600 mb-6">
              {searchQuery ? '別のキーワードで検索してください' : '新しいトーナメントを作成してください'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/tournament/new')}
                className="
                  px-6 py-3 rounded-lg font-display font-bold
                  bg-gradient-to-r from-cyber-accent to-cyber-accent2
                  text-white
                "
              >
                トーナメントを作成
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TournamentCard tournament={tournament} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
