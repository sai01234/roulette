'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWAがすでにインストール済みかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // インストールプロンプトイベントをキャプチャ
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // ユーザーが以前に閉じていない場合のみ表示
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // インストール完了時
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // インストールプロンプトを表示
    deferredPrompt.prompt();

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    // プロンプトをクリア
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 1週間は表示しない
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const dismissedUntil = Date.now() + oneWeek;
    localStorage.setItem('pwa-prompt-dismissed', dismissedUntil.toString());
  };

  // すでにインストール済み、またはプロンプトを表示しない場合は何も表示しない
  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div className="panel p-4 border-2 border-cyber-accent/50 bg-cyber-card/95 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            {/* アイコン */}
            <div className="w-12 h-12 rounded-lg bg-cyber-accent/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-cyber-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* コンテンツ */}
            <div className="flex-1">
              <h3 className="font-display text-white font-bold mb-1">
                アプリをインストール
              </h3>
              <p className="text-sm text-gray-400 font-body mb-3">
                ホーム画面に追加して、いつでも素早くアクセス
              </p>

              {/* ボタン */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstallClick}
                  className="
                    px-4 py-2 rounded-lg font-body text-sm font-bold
                    bg-cyber-accent hover:bg-cyber-accent-dark
                    text-white transition-all
                  "
                >
                  インストール
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDismiss}
                  className="
                    px-4 py-2 rounded-lg font-body text-sm
                    bg-cyber-card border border-cyber-accent/30
                    text-gray-400 hover:text-white
                    hover:border-cyber-accent/60
                    transition-all
                  "
                >
                  後で
                </motion.button>
              </div>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
