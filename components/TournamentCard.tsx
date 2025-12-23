'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Tournament } from '@/lib/types';

interface TournamentCardProps {
  tournament: Tournament;
  onDelete?: () => void;
}

export default function TournamentCard({ tournament, onDelete }: TournamentCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      // 親コンポーネントに削除を通知
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('トーナメントの削除に失敗しました');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative">
      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 rounded-lg"
          onClick={handleCancelDelete}
        >
          <div
            className="panel p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-white mb-3">
              削除確認
            </h3>
            <p className="font-body text-gray-300 mb-6">
              「{tournament.name}」を削除しますか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="
                  flex-1 px-4 py-2 rounded-lg font-body
                  bg-cyber-card border border-gray-600
                  text-gray-300 hover:text-white
                  transition-colors
                "
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="
                  flex-1 px-4 py-2 rounded-lg font-body font-bold
                  bg-red-500 hover:bg-red-600
                  text-white
                  transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
          {/* 削除ボタン */}
          <button
            onClick={handleDeleteClick}
            className="
              absolute top-4 right-4 z-10
              w-8 h-8 rounded-lg
              bg-red-500/20 border border-red-500/50
              hover:bg-red-500/30 hover:border-red-500
              text-red-400 hover:text-red-300
              transition-all
              flex items-center justify-center
            "
            title="削除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* ステータスバッジ */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-body
                ${
                  isCompleted
                    ? 'bg-gray-700/50 border border-gray-600 text-gray-400'
                    : 'bg-cyber-accent/10 border border-cyber-accent/30 text-cyber-accent-light'
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
        <h3 className="font-display text-2xl font-bold mb-3 text-white">
          {tournament.name}
        </h3>

        {/* 統計情報 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-cyber-card/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-body mb-1">参加者数</p>
            <p className="font-display text-xl text-white">
              {tournament.totalParticipants}名
            </p>
          </div>

          <div className="bg-cyber-card/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-body mb-1">ラウンド数</p>
            <p className="font-display text-xl text-white">
              {tournament.tournamentData?.rounds?.length || 0}
            </p>
          </div>
        </div>

        {/* チャンピオン情報 */}
        {isCompleted && tournament.winnerData && (
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
              {tournament.winnerData?.name || '不明'}
            </p>
            <p className="text-xs text-gray-500 font-body">
              最終枠数: {tournament.winnerData?.frames || 0}
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
    </div>
  );
}
