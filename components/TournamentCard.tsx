'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Tournament } from '@/lib/types';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const isCompleted = tournament.completedAt !== null;
  const createdDate = new Date(tournament.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedDate = tournament.completedAt
    ? new Date(tournament.completedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Link href={`/tournament/${tournament.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="
          panel p-6 cursor-pointer
          border-2 border-transparent
          hover:border-cyber-accent/50
          transition-all duration-300
          h-full
        "
      >
        {/* ステータスバッジ */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-display font-bold
              ${
                isCompleted
                  ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                  : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
              }
            `}
          >
            {isCompleted ? '完了' : '進行中'}
          </span>

          {/* トーナメント形式 */}
          <span className="text-xs text-gray-500 font-body">
            {tournament.format === '3way' ? '3人対戦' : '1対1'}
          </span>
        </div>

        {/* トーナメント名 */}
        <h3 className="font-display text-2xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyber-accent to-cyber-accent2 bg-clip-text text-transparent">
            {tournament.name}
          </span>
        </h3>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-cyber-card/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 font-body mb-1">参加者数</p>
            <p className="font-display text-xl text-cyber-accent">
              {tournament.totalParticipants}名
            </p>
          </div>

          <div className="bg-cyber-card/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 font-body mb-1">ラウンド数</p>
            <p className="font-display text-xl text-cyber-accent2">
              {tournament.tournamentData.rounds.length}
            </p>
          </div>
        </div>

        {/* チャンピオン情報 */}
        {isCompleted && tournament.winnerData && (
          <div className="
            bg-gradient-to-r from-cyber-gold/10 to-cyber-gold/5
            border border-cyber-gold/30
            rounded-lg p-3 mb-4
          ">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-cyber-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-xs text-gray-400 font-body">チャンピオン</p>
            </div>
            <p className="font-display text-lg font-bold text-cyber-gold">
              {tournament.winnerData.name}
            </p>
            <p className="text-xs text-gray-400 font-body">
              最終枠数: {tournament.winnerData.frames}
            </p>
          </div>
        )}

        {/* 日付情報 */}
        <div className="space-y-1 text-xs text-gray-500 font-body">
          <p>作成日: {createdDate}</p>
          {completedDate && <p>完了日: {completedDate}</p>}
        </div>

        {/* ホバー時のアイコン */}
        <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-cyber-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
