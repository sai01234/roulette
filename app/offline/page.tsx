'use client';

import { motion } from 'framer-motion';

export default function OfflinePage() {
  return (
    <main className="min-h-screen cyber-grid-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel p-8 max-w-md text-center"
      >
        {/* オフラインアイコン */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-20 h-20 mx-auto mb-6"
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            className="w-full h-full text-cyber-accent"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="4"
              opacity="0.2"
            />
            <path
              d="M30 30 L70 70 M70 30 L30 70"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* メッセージ */}
        <h1 className="font-display text-3xl text-white mb-4">
          オフラインです
        </h1>
        <p className="font-body text-gray-400 mb-6">
          インターネット接続を確認してください。<br />
          接続が復旧すると自動的に再開されます。
        </p>

        {/* 再試行ボタン */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="
            px-6 py-3 rounded-lg font-display font-bold
            bg-gradient-to-r from-cyber-accent to-cyber-accent2
            text-white shadow-lg shadow-cyber-accent/20
            transition-all
          "
        >
          再試行
        </motion.button>

        {/* オフライン時のヒント */}
        <div className="mt-8 p-4 rounded-lg bg-cyber-accent/10 border border-cyber-accent/30">
          <p className="text-xs text-gray-400 font-body">
            💡 一部のページはオフラインでも表示できます
          </p>
        </div>
      </motion.div>
    </main>
  );
}
