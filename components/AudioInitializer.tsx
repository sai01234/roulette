'use client';

import { useEffect } from 'react';
import { audioManager } from '@/lib/audio-manager';

/**
 * アプリケーション起動時に効果音をプリロードするコンポーネント
 */
export default function AudioInitializer() {
  useEffect(() => {
    // 効果音をプリロード
    audioManager.preload('roulette-spin', '/sounds/roulette-spin.mp3');
    audioManager.preload('victory', '/sounds/victory.mp3');
    audioManager.preload('click', '/sounds/click.mp3');
  }, []);

  return null; // UIは表示しない
}
