'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Participant } from '@/lib/types';
import { assignSeed, generateTournament } from '@/lib/tournament-manager';
import CSVImport from '@/components/CSVImport';

export default function NewTournamentPage() {
  const router = useRouter();
  const [tournamentName, setTournamentName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // 現在の日付から提案を生成
  const getSuggestedNames = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return [
      `${year}年${month}月`,
      `${year}年${month}月大会`,
      `第${month}回大会`,
    ];
  };

  // CSVインポート処理
  const handleImport = useCallback((importedParticipants: Participant[]) => {
    const participantsWithSeed = assignSeed(importedParticipants);
    setParticipants(participantsWithSeed);
    setError('');
  }, []);

  // トーナメント作成
  const handleCreate = async () => {
    if (!tournamentName.trim()) {
      setError('トーナメント名を入力してください');
      return;
    }

    if (participants.length === 0) {
      setError('参加者をインポートしてください');
      return;
    }

    try {
      setIsCreating(true);
      setError('');

      // トーナメントデータ生成
      const tournamentData = generateTournament(participants);

      // APIに送信
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tournamentName.trim(),
          participants,
          tournamentData,
        }),
      });

      if (!response.ok) {
        throw new Error('トーナメントの作成に失敗しました');
      }

      const data = await response.json();

      // 作成されたトーナメントページに移動
      router.push(`/tournament/${data.tournament.id}`);
    } catch (err) {
      setError('トーナメントの作成中にエラーが発生しました');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen cyber-grid-bg">
      {/* ヘッダー */}
      <header className="header-gradient border-b border-cyber-accent/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
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

            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                新規トーナメント作成
              </h1>
              <p className="font-body text-sm text-gray-500 mt-1">
                トーナメント名を入力し、参加者をインポートしてください
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* トーナメント名入力 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel p-6"
          >
            <h2 className="font-display text-xl font-bold text-cyber-accent mb-4">
              トーナメント名
            </h2>

            <input
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="例: 2026年1月、第1回大会"
              className="
                w-full px-4 py-3 rounded-lg mb-4
                bg-cyber-card border-2 border-cyber-accent/20
                text-white font-body text-lg
                focus:outline-none focus:border-cyber-accent
                transition-colors
              "
            />

            {/* 提案 */}
            <div>
              <p className="text-sm text-gray-400 font-body mb-2">提案:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedNames().map((name) => (
                  <button
                    key={name}
                    onClick={() => setTournamentName(name)}
                    className="
                      px-3 py-1 rounded-lg text-sm font-body
                      bg-cyber-card border border-cyber-accent/30
                      text-gray-300 hover:text-white
                      hover:border-cyber-accent/60
                      transition-all
                    "
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CSV参加者インポート */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="panel p-6"
          >
            <h2 className="font-display text-xl font-bold text-cyber-accent mb-4">
              参加者インポート
            </h2>

            <CSVImport onImport={handleImport} disabled={false} />

            {/* 参加者プレビュー */}
            {participants.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 pt-6 border-t border-cyber-accent/20"
              >
                <p className="font-body text-sm text-gray-400 mb-3">
                  インポートされた参加者 ({participants.length}名)
                </p>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="
                        flex items-center justify-between
                        px-3 py-2 rounded-lg
                        bg-cyber-card/50
                      "
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="font-body text-white">{p.name}</span>
                        {p.isSeed && (
                          <span className="px-2 py-0.5 rounded text-xs bg-cyber-gold/20 border border-cyber-gold/50 text-cyber-gold font-display">
                            シード
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-cyber-accent font-display">
                        {p.frames}枠
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* エラー表示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                panel p-4
                bg-red-500/20 border-2 border-red-500/50
              "
            >
              <div className="flex items-center gap-2 text-red-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          {/* 作成ボタン */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={isCreating || participants.length === 0 || !tournamentName.trim()}
            className="
              w-full py-4 rounded-lg font-display text-lg font-bold
              bg-cyber-accent hover:bg-cyber-accent-dark
              text-white shadow-lg shadow-cyber-accent/20
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                作成中...
              </div>
            ) : (
              'トーナメントを作成'
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
