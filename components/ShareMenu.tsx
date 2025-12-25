'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tournament } from '@/lib/types';
import {
  shareToTwitter,
  downloadTournamentScreenshot,
  generateShareText,
  copyToClipboard,
} from '@/lib/share-utils';

interface ShareMenuProps {
  tournament: Tournament;
  onClose?: () => void;
}

export default function ShareMenu({ tournament, onClose }: ShareMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleScreenshot = async () => {
    setIsProcessing(true);
    try {
      await downloadTournamentScreenshot(tournament);
      showNotification('スクリーンショットをダウンロードしました');
    } catch (error) {
      console.error('Screenshot error:', error);
      showNotification('スクリーンショットの保存に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTwitterShare = async () => {
    try {
      await shareToTwitter(tournament);
      showNotification('テキストをコピーしました！');
    } catch (error) {
      console.error('Twitter share error:', error);
      showNotification('共有に失敗しました');
    }
  };

  const handleCopyText = async () => {
    try {
      const text = generateShareText(tournament);
      await copyToClipboard(text);
      showNotification('テキストをコピーしました');
    } catch (error) {
      console.error('Copy error:', error);
      showNotification('コピーに失敗しました');
    }
  };

  return (
    <div className="relative">
      {/* 通知 */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-50
              px-4 py-2 rounded-lg
              bg-green-500/20 border border-green-500/50
              text-green-300 text-sm font-body whitespace-nowrap"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 共有ボタン */}
      <div className="flex flex-col gap-3">
        {/* スクリーンショット */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleScreenshot}
          disabled={isProcessing}
          className="
            flex items-center gap-3 px-6 py-3 rounded-lg
            bg-cyber-accent hover:bg-cyber-accent-dark
            text-white font-display
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isProcessing ? 'ダウンロード中...' : 'スクリーンショット'}
        </motion.button>

        {/* X/Twitter共有 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTwitterShare}
          className="
            flex items-center gap-3 px-6 py-3 rounded-lg
            bg-[#1DA1F2] hover:bg-[#1a8cd8]
            text-white font-display
            transition-colors
          "
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X で共有
        </motion.button>

        {/* テキストコピー */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyText}
          className="
            flex items-center gap-3 px-6 py-3 rounded-lg
            bg-cyber-card border border-cyber-accent/30
            text-gray-300 hover:text-white hover:border-cyber-accent/60
            font-display
            transition-all
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          テキストをコピー
        </motion.button>

        {/* 閉じるボタン（オプション） */}
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="
              mt-2 px-6 py-2 rounded-lg
              text-gray-500 hover:text-gray-300
              font-body text-sm
              transition-colors
            "
          >
            閉じる
          </motion.button>
        )}
      </div>
    </div>
  );
}
