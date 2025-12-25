'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tournament } from '@/lib/types';
import TournamentBracket from '@/components/TournamentBracket';
import ParticipantPanel from '@/components/ParticipantPanel';

export default function PublicTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  const fetchTournament = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tournaments/${id}`);

      if (!response.ok) {
        throw new Error('トーナメントの取得に失敗しました');
      }

      const data = await response.json();
      setTournament(data.tournament);
    } catch (error) {
      console.error('Fetch tournament error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen cyber-grid-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16"
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
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="min-h-screen cyber-grid-bg flex items-center justify-center">
        <div className="panel p-8 text-center">
          <p className="text-red-400 font-body mb-4">トーナメントが見つかりません</p>
          <button
            onClick={() => router.push('/public')}
            className="px-6 py-2 rounded-lg bg-cyber-accent text-white font-body"
          >
            一覧に戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen cyber-grid-bg">
      {/* ヘッダー */}
      <header className="header-gradient border-b border-cyber-accent/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/public')}
              className="
                p-2 rounded-lg
                bg-cyber-card border border-cyber-accent/30
                text-gray-300 hover:text-white
                hover:border-cyber-accent/60
                transition-all
              "
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </motion.button>

            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl md:text-4xl font-bold text-white"
              >
                {tournament.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-body text-sm text-gray-500 mt-1"
              >
                最強管理者権限争奪戦 - 結果閲覧
              </motion.p>
            </div>

            {/* 管理者ログインボタン */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="
                px-4 py-2 rounded-lg font-body text-sm
                bg-cyber-card border border-cyber-accent/30
                text-gray-300 hover:text-white
                hover:border-cyber-accent/60
                transition-all
              "
            >
              管理者ログイン
            </motion.button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左側：参加者パネル */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="panel p-6 sticky top-4">
              <ParticipantPanel
                participants={tournament.participants}
                onReset={() => {}}
                hasStarted={true}
                showReset={false}
              />
            </div>
          </motion.aside>

          {/* 右側：トーナメント表 */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="panel p-6">
              {/* トーナメント情報 */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                  <span className="text-xs text-gray-400 font-body block">参加者数</span>
                  <span className="font-display text-xl text-cyber-accent">
                    {tournament.totalParticipants}名
                  </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                  <span className="text-xs text-gray-400 font-body block">ラウンド数</span>
                  <span className="font-display text-xl text-cyber-accent2">
                    {tournament.tournamentData?.rounds?.length || 0}
                  </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                  <span className="text-xs text-gray-400 font-body block">対戦形式</span>
                  <span className="font-display text-xl text-cyber-purple">
                    {tournament.format === '3way' ? '3人対戦' : '1対1'}
                  </span>
                </div>
                {tournament.completedAt && (
                  <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                    <span className="text-xs text-gray-400 font-body block">完了日</span>
                    <span className="font-display text-sm text-gray-300">
                      {new Date(tournament.completedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                )}
              </div>

              {/* トーナメントブラケット（閲覧専用） */}
              <div id="tournament-bracket">
                <TournamentBracket
                  tournamentData={tournament.tournamentData}
                  onMatchClick={() => {}} // 閲覧専用なのでクリック無効
                  onSeedAdvance={() => {}} // 閲覧専用なのでクリック無効
                />
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* フッター */}
      <footer className="border-t border-cyber-accent/10 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="font-body text-sm text-gray-500">
            © 2025 最強管理者権限争奪戦
          </p>
        </div>
      </footer>
    </main>
  );
}
