'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { audioManager } from '@/lib/audio-manager';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // マウント時に現在の設定を読み込み
    setEnabled(audioManager.isEnabled());
  }, []);

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    audioManager.setEnabled(newState);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="
        relative p-2 rounded-lg
        bg-cyber-card border border-cyber-accent/30
        hover:border-cyber-accent/60
        text-2xl
        transition-all
      "
      title={enabled ? '効果音をオフにする' : '効果音をオンにする'}
    >
      {enabled ? '🔊' : '🔇'}

      {/* ステータスインジケーター */}
      <motion.div
        initial={false}
        animate={{
          scale: enabled ? 1 : 0,
          opacity: enabled ? 1 : 0,
        }}
        className="
          absolute -top-1 -right-1
          w-3 h-3 rounded-full
          bg-green-500
          border-2 border-cyber-bg
        "
      />
    </motion.button>
  );
}
