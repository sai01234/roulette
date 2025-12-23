'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, TournamentData, Match, Tournament } from '@/lib/types';
import {
  recordMatchResult,
  advanceSeedMatch,
} from '@/lib/tournament-manager';
import ParticipantPanel from '@/components/ParticipantPanel';
import TournamentBracket from '@/components/TournamentBracket';
import RouletteOverlay from '@/components/RouletteOverlay';
import WinnerCelebration from '@/components/WinnerCelebration';

export default function TournamentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // トーナメント取得
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

      // 優勝者がいる場合、セレブレーションを表示
      if (data.tournament.winnerData) {
        setShowWinner(true);
      }
    } catch (error) {
      console.error('Fetch tournament error:', error);
      showNotification('error', 'トーナメントの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // トーナメント更新
  const updateTournament = async (
    updatedTournamentData: TournamentData,
    winnerData: Participant | null = null
  ) => {
    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentData: updatedTournamentData,
          winnerData,
        }),
      });

      if (!response.ok) {
        throw new Error('トーナメントの更新に失敗しました');
      }

      const data = await response.json();
      setTournament(data.tournament);
      return data.tournament;
    } catch (error) {
      console.error('Update tournament error:', error);
      throw error;
    }
  };

  // 通知を表示
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 対戦クリック処理
  const handleMatchClick = useCallback((match: Match) => {
    setSelectedMatch(match);
  }, []);

  // シード進出処理
  const handleSeedAdvance = useCallback(async (match: Match) => {
    if (!tournament) return;

    try {
      const updatedTournamentData = advanceSeedMatch(tournament.tournamentData, match.id);
      const participant = match.participants[0];

      // 優勝者チェック
      const winnerData = updatedTournamentData.winner || null;

      await updateTournament(updatedTournamentData, winnerData);

      showNotification('success', `${participant.name}が自動進出しました（枠数2倍: ${participant.frames * 2}）`);

      if (winnerData) {
        setShowWinner(true);
      }
    } catch (error) {
      showNotification('error', 'シード進出に失敗しました');
    }
  }, [tournament, showNotification]);

  // 勝者確定処理
  const handleConfirmWinner = useCallback(async (winnerId: string) => {
    if (!tournament || !selectedMatch) return;

    try {
      const updatedTournamentData = recordMatchResult(tournament.tournamentData, selectedMatch.id, winnerId);
      setSelectedMatch(null);

      const winner = selectedMatch.participants.find(p => p.id === winnerId);

      // 優勝者チェック
      const winnerData = updatedTournamentData.winner || null;

      await updateTournament(updatedTournamentData, winnerData);

      showNotification('success', `${winner?.name}が勝利しました！`);

      if (winnerData) {
        setTimeout(() => setShowWinner(true), 500);
      }
    } catch (error) {
      showNotification('error', '結果の記録に失敗しました');
    }
  }, [tournament, selectedMatch, showNotification]);

  // 対戦キャンセル
  const handleCancelMatch = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  // リセット処理（使用しない）
  const handleReset = useCallback(() => {
    alert('トーナメントのリセットはダッシュボードから新しいトーナメントを作成してください');
  }, []);

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
      </main>
    );
  }

  if (!tournament) {
    return (
      <main className="min-h-screen cyber-grid-bg flex items-center justify-center">
        <div className="panel p-8 text-center">
          <p className="text-red-400 font-body mb-4">トーナメントが見つかりません</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 rounded-lg bg-cyber-accent text-white font-body"
          >
            ダッシュボードに戻る
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
              onClick={() => router.push('/dashboard')}
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
                className="font-display text-2xl md:text-4xl font-bold"
              >
                <span className="bg-gradient-to-r from-cyber-accent via-cyber-purple to-cyber-accent2 bg-clip-text text-transparent">
                  {tournament.name}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-body text-sm text-gray-400 mt-1"
              >
                最強管理者権限争奪戦
              </motion.p>
            </div>
          </div>
        </div>
      </header>

      {/* 通知エリア */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`
              fixed top-4 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-lg shadow-lg
              font-body text-sm backdrop-blur-md
              ${notification.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                : 'bg-red-500/20 border border-red-500/50 text-red-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                onReset={handleReset}
                hasStarted={true}
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
                    {tournament.tournamentData.rounds.length}
                  </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                  <span className="text-xs text-gray-400 font-body block">対戦形式</span>
                  <span className="font-display text-xl text-cyber-purple">
                    {tournament.format === '3way' ? '3人対戦' : '1対1'}
                  </span>
                </div>
              </div>

              {/* トーナメントブラケット */}
              <TournamentBracket
                tournamentData={tournament.tournamentData}
                onMatchClick={handleMatchClick}
                onSeedAdvance={handleSeedAdvance}
              />
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

      {/* ルーレットオーバーレイ */}
      <AnimatePresence>
        {selectedMatch && (
          <RouletteOverlay
            match={selectedMatch}
            onConfirmWinner={handleConfirmWinner}
            onCancel={handleCancelMatch}
          />
        )}
      </AnimatePresence>

      {/* 優勝者表示 */}
      <AnimatePresence>
        {showWinner && tournament.winnerData && (
          <WinnerCelebration
            winner={tournament.winnerData}
            onClose={() => setShowWinner(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
