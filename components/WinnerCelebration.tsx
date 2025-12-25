'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '@/lib/types';

interface WinnerCelebrationProps {
  winner: Participant;
  onClose: () => void;
}

// 紙吹雪のパーティクル
const Confetti = ({ delay, index }: { delay: number; index: number }) => {
  const colors = ['#6366f1', '#818cf8', '#fbbf24', '#f59e0b', '#60a5fa', '#a78bfa'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // 画面を均等に分割して配置
  const section = (index % 10) * 10; // 0, 10, 20, 30...90
  const randomStartX = section + Math.random() * 10; // 各セクション内でランダム

  const randomSwing = -20 + Math.random() * 40; // 中心からの揺れ
  const randomDuration = 3 + Math.random() * 3;
  const randomRotation = Math.random() * 360;
  const randomSize = 4 + Math.random() * 6;
  const randomStartY = -150 - Math.random() * 100; // さらに高い位置から

  return (
    <motion.div
      initial={{
        x: `${randomStartX}vw`,
        y: randomStartY,
        rotate: randomRotation,
        opacity: 1,
        scale: 1
      }}
      animate={{
        x: `${randomStartX + randomSwing}vw`,
        y: '110vh',
        rotate: randomRotation + 1080,
        opacity: [1, 1, 0.8, 0],
        scale: [1, 1.2, 0.8, 0.4]
      }}
      transition={{
        duration: randomDuration,
        delay,
        ease: 'linear'
      }}
      className="fixed pointer-events-none z-50"
      style={{
        backgroundColor: randomColor,
        width: `${randomSize}px`,
        height: `${randomSize}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
      }}
    />
  );
};

export default function WinnerCelebration({ winner, onClose }: WinnerCelebrationProps) {
  const [confetti, setConfetti] = useState<number[]>([]);

  useEffect(() => {
    // 紙吹雪を生成（より多く、より派手に）
    const particles: number[] = [];
    for (let i = 0; i < 150; i++) {
      particles.push(i * 0.05);
    }
    setConfetti(particles);

    // 自動で閉じる（オプション）
    // const timer = setTimeout(onClose, 10000);
    // return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* 紙吹雪 */}
        {confetti.map((delay, i) => (
          <Confetti key={i} delay={delay} index={i} />
        ))}

        {/* 背景オーバーレイ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* メインコンテンツ */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100,
            delay: 0.2
          }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 text-center p-12"
        >
          {/* 光のエフェクト */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 bg-gradient-radial from-cyber-gold/30 to-transparent rounded-full blur-3xl"
          />

          {/* トロフィー */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotateY: [0, 360]
            }}
            transition={{ 
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              rotateY: { duration: 4, repeat: Infinity, ease: 'linear' }
            }}
            className="text-8xl mb-6"
            style={{ perspective: '1000px' }}
          >
            🏆
          </motion.div>

          {/* タイトル */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-display text-5xl md:text-7xl mb-4"
          >
            <span className="bg-gradient-to-r from-cyber-gold via-yellow-300 to-cyber-gold bg-clip-text text-transparent">
              CHAMPION
            </span>
          </motion.h1>

          {/* 勝者名 */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="font-display text-3xl md:text-5xl text-white mb-4">
              {winner.name}
            </p>
            <p className="font-body text-xl text-cyber-accent2">
              最終獲得枠数: <span className="font-display text-2xl text-cyber-gold">{winner.frames}</span>
            </p>
          </motion.div>

          {/* メッセージ */}
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 font-display text-xl text-cyber-accent"
          >
            🎊 最強管理者権限獲得 🎊
          </motion.p>

          {/* 閉じるボタン */}
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="relative z-20 mt-8 px-8 py-3 rounded-lg bg-gradient-to-r from-cyber-gold to-yellow-500
              text-black font-display text-lg font-bold shadow-lg shadow-cyber-gold/30 cursor-pointer"
          >
            閉じる
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

