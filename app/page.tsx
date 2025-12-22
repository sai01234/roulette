'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, TournamentData, Match, TournamentState } from '@/lib/types';
import {
  loadTournamentState,
  saveTournamentState,
  resetTournament,
  assignSeed,
  generateTournament,
  recordMatchResult,
  advanceSeedMatch,
} from '@/lib/tournament-manager';
import CSVImport from '@/components/CSVImport';
import ParticipantPanel from '@/components/ParticipantPanel';
import TournamentBracket from '@/components/TournamentBracket';
import RouletteOverlay from '@/components/RouletteOverlay';
import WinnerCelebration from '@/components/WinnerCelebration';

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 初期化時にローカルストレージから復元
  useEffect(() => {
    const savedState = loadTournamentState();
    if (savedState) {
      setParticipants(savedState.participants);
      setTournamentData(savedState.tournamentData);
      setIsInitialized(savedState.isInitialized);
    }
  }, []);

  // 状態変更時に保存
  useEffect(() => {
    if (participants.length > 0 || tournamentData) {
      const state: TournamentState = {
        participants,
        tournamentData,
        isInitialized,
      };
      saveTournamentState(state);
    }
  }, [participants, tournamentData, isInitialized]);

  // 通知を表示
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // CSVインポート処理
  const handleImport = useCallback((importedParticipants: Participant[]) => {
    const participantsWithSeed = assignSeed(importedParticipants);
    setParticipants(participantsWithSeed);
    
    const tournament = generateTournament(participantsWithSeed);
    setTournamentData(tournament);
    setIsInitialized(true);
    
    showNotification('success', `${importedParticipants.length}人の参加者を追加しました`);
  }, [showNotification]);

  // リセット処理
  const handleReset = useCallback(() => {
    if (confirm('トーナメントをリセットしますか？すべてのデータが削除されます。')) {
      resetTournament();
      setParticipants([]);
      setTournamentData(null);
      setIsInitialized(false);
      setSelectedMatch(null);
      setShowWinner(false);
      showNotification('success', 'トーナメントがリセットされました');
    }
  }, [showNotification]);

  // 対戦クリック処理
  const handleMatchClick = useCallback((match: Match) => {
    setSelectedMatch(match);
  }, []);

  // シード進出処理
  const handleSeedAdvance = useCallback((match: Match) => {
    if (!tournamentData) return;
    
    try {
      const updatedTournament = advanceSeedMatch(tournamentData, match.id);
      setTournamentData(updatedTournament);
      
      const participant = match.participants[0];
      showNotification('success', `${participant.name}が自動進出しました（枠数2倍: ${participant.frames * 2}）`);
      
      // 優勝者チェック
      if (updatedTournament.winner) {
        setShowWinner(true);
      }
    } catch (error) {
      showNotification('error', 'シード進出に失敗しました');
    }
  }, [tournamentData, showNotification]);

  // 勝者確定処理
  const handleConfirmWinner = useCallback((winnerId: string) => {
    if (!tournamentData || !selectedMatch) return;
    
    try {
      const updatedTournament = recordMatchResult(tournamentData, selectedMatch.id, winnerId);
      setTournamentData(updatedTournament);
      setSelectedMatch(null);
      
      const winner = selectedMatch.participants.find(p => p.id === winnerId);
      showNotification('success', `${winner?.name}が勝利しました！`);
      
      // 優勝者チェック
      if (updatedTournament.winner) {
        setTimeout(() => setShowWinner(true), 500);
      }
    } catch (error) {
      showNotification('error', '結果の記録に失敗しました');
    }
  }, [tournamentData, selectedMatch, showNotification]);

  // 対戦キャンセル
  const handleCancelMatch = useCallback(() => {
    setSelectedMatch(null);
  }, []);

  return (
    <main className="min-h-screen cyber-grid-bg">
      {/* ヘッダー */}
      <header className="header-gradient border-b border-cyber-accent/20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-3xl md:text-5xl font-bold mb-2"
            >
              <span className="bg-gradient-to-r from-cyber-accent via-cyber-purple to-cyber-accent2 bg-clip-text text-transparent">
                モデレーターバトロワルーレット
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-body text-lg text-gray-400"
            >
              最強管理者権限争奪戦
            </motion.p>
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
              <div className="mb-6">
                <CSVImport 
                  onImport={handleImport} 
                  disabled={isInitialized && participants.length > 0}
                />
              </div>
              <ParticipantPanel 
                participants={participants}
                onReset={handleReset}
                hasStarted={isInitialized}
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
              {tournamentData && (
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                    <span className="text-xs text-gray-400 font-body block">参加者数</span>
                    <span className="font-display text-xl text-cyber-accent">
                      {tournamentData.totalParticipants}名
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                    <span className="text-xs text-gray-400 font-body block">ラウンド数</span>
                    <span className="font-display text-xl text-cyber-accent2">
                      {tournamentData.rounds.length}
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-cyber-card border border-cyber-accent/20">
                    <span className="text-xs text-gray-400 font-body block">対戦形式</span>
                    <span className="font-display text-xl text-cyber-purple">
                      {tournamentData.format === '3way' ? '3人対戦' : '1対1'}
                    </span>
                  </div>
                </div>
              )}

              {/* トーナメントブラケット */}
              {tournamentData ? (
                <TournamentBracket
                  tournamentData={tournamentData}
                  onMatchClick={handleMatchClick}
                  onSeedAdvance={handleSeedAdvance}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-24 h-24 mb-6 opacity-20"
                  >
                    <svg viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50 0A50 50 0 1050 100A50 50 0 1050 0zM50 90A40 40 0 1150 10A40 40 0 1150 90z" opacity="0.3"/>
                      <path d="M50 10A40 40 0 0150 90" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                  <p className="font-display text-xl mb-2">トーナメント未開始</p>
                  <p className="font-body text-sm">CSVファイルをアップロードして開始</p>
                </div>
              )}
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
        {showWinner && tournamentData?.winner && (
          <WinnerCelebration
            winner={tournamentData.winner}
            onClose={() => setShowWinner(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

