'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'ログインに失敗しました');
        setPassword('');
      }
    } catch (err) {
      setError('エラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen cyber-grid-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="panel p-8 w-full max-w-md"
      >
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden"
            style={{ opacity: 1 }}
          >
            <img
              src="/icon.jpg"
              alt="Admin Battle Royale"
              className="w-full h-full object-cover"
              style={{ opacity: 1 }}
            />
          </motion.div>

          <h1 className="font-display text-3xl font-bold mb-2 text-white">
            管理者ログイン
          </h1>
          <p className="font-body text-gray-500 text-sm">
            モデレーターバトロワルーレット
          </p>
        </div>

        {/* ログインフォーム */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="font-body text-sm text-gray-300 block mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="
                w-full px-4 py-3 rounded-lg
                bg-cyber-card border-2 border-cyber-accent/20
                text-white font-body
                focus:outline-none focus:border-cyber-accent
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              placeholder="パスワードを入力してください"
              required
              autoFocus
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                p-3 rounded-lg
                bg-red-500/20 border border-red-500/50
                text-red-300 font-body text-sm
              "
            >
              <div className="flex items-center gap-2">
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

          {/* ログインボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full py-3 rounded-lg font-display text-lg font-bold
              bg-cyber-accent hover:bg-cyber-accent-dark
              text-white
              transition-all transform hover:scale-[1.02]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              shadow-lg shadow-cyber-accent/20
            "
          >
            {isLoading ? (
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
                ログイン中...
              </div>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        {/* フッター */}
        <div className="mt-8 text-center space-y-4">
          {/* 結果を見るリンク */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/public')}
            className="
              w-full py-3 rounded-lg font-body
              bg-cyber-card border border-cyber-accent/30
              text-gray-300 hover:text-white
              hover:border-cyber-accent/60
              transition-all
            "
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              ログインせずに結果を見る
            </div>
          </motion.button>

          <p className="font-body text-xs text-gray-500">
            最強管理者権限争奪戦
          </p>
        </div>
      </motion.div>
    </main>
  );
}
