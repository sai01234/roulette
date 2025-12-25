'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament } from '@/lib/types';
import Link from 'next/link';

export default function PublicTournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      if (Array.isArray(data.tournaments)) {
        // 完了済みのトーナメントのみ表示
        setTournaments(data.tournaments.filter(t => t.completedAt !== null));
      } else {
        setTournaments([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament =>
    tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen cyber-grid-bg">
      {/* ヘッダー */}
      <header className="header-gradient border-b border-cyber-accent/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                トーナメント結果
              </h1>
              <p className="font-body text-sm text-gray-500 mt-1">
                過去のトーナメント結果を閲覧
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="
                px-4 py-2 rounded-lg font-body text-sm
                bg-cyber-accent hover:bg-cyber-accent-dark
                text-white
                transition-all
              "
            >
              管理者ログイン
            </motion.button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 統計カード */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <div className="panel p-6">
            <p className="text-sm text-gray-500 font-body mb-2">完了済みトーナメント</p>
            <p className="text-4xl font-display font-bold text-white">
              {tournaments.length}
            </p>
          </div>

          <div className="panel p-6">
            <p className="text-sm text-gray-500 font-body mb-2">総参加者数</p>
            <p className="text-4xl font-display font-bold text-cyber-accent">
              {tournaments.reduce((sum, t) => sum + t.totalParticipants, 0)}
            </p>
          </div>
        </motion.div>

        {/* 検索バー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
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
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="60 200"
                  opacity="0.8"
                />
              </svg>
            </motion.div>
            <p className="text-gray-500 font-body">読み込み中...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-body text-lg mb-4">
              {searchQuery ? '検索結果が見つかりませんでした' : '完了済みのトーナメントがありません'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTournaments.map((tournament, index) => (
              <Link key={tournament.id} href={`/public/tournament/${tournament.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    panel p-6 cursor-pointer
                    border-2 border-transparent
                    hover:border-cyber-accent/50
                    transition-all duration-300
                  "
                >
                  {/* トーナメント名 */}
                  <h3 className="font-display text-2xl font-bold mb-3 text-white">
                    {tournament.name}
                  </h3>

                  {/* チャンピオン情報 */}
                  {tournament.winnerData && (
                    <div className="
                      bg-cyber-gold/5
                      border border-cyber-gold/20
                      rounded-lg p-3 mb-4
                    ">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-cyber-gold" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-xs text-gray-500 font-body">チャンピオン</p>
                      </div>
                      <p className="font-display text-base font-bold text-cyber-gold">
                        {tournament.winnerData.name}
                      </p>
                      <p className="text-xs text-gray-500 font-body">
                        最終枠数: {tournament.winnerData.frames}
                      </p>
                    </div>
                  )}

                  {/* 統計情報 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-cyber-card/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-body mb-1">参加者数</p>
                      <p className="font-display text-xl text-white">
                        {tournament.totalParticipants}名
                      </p>
                    </div>

                    <div className="bg-cyber-card/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-body mb-1">形式</p>
                      <p className="font-display text-base text-white">
                        {tournament.format === '3way' ? '3人対戦' : '1対1'}
                      </p>
                    </div>
                  </div>

                  {/* 日付情報 */}
                  <div className="text-xs text-gray-500 font-body">
                    <p>完了日: {new Date(tournament.completedAt!).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
