'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function BackupManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 手動エクスポート
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setMessage(null);

      const response = await fetch('/api/backup/export');

      if (!response.ok) {
        throw new Error('エクスポートに失敗しました');
      }

      // Blobとしてダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Content-Dispositionヘッダーからファイル名を取得
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || 'backup.json';

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'バックアップをダウンロードしました' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'エクスポートに失敗しました' });
    } finally {
      setIsExporting(false);
    }
  };

  // バックアップから復元
  const handleRestore = async (file: File) => {
    try {
      setIsRestoring(true);
      setMessage(null);

      // ファイルをJSONとして読み込み
      const text = await file.text();
      const backupData = JSON.parse(text);

      // 復元API呼び出し
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '復元に失敗しました');
      }

      const result = await response.json();
      setMessage({
        type: 'success',
        text: `${result.imported}件のトーナメントを復元しました`,
      });

      // ページをリロードして更新
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Restore error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '復元に失敗しました',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // ファイル選択ハンドラー
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setMessage({ type: 'error', text: 'JSONファイルを選択してください' });
        return;
      }
      handleRestore(file);
    }
  };

  return (
    <div className="panel p-6">
      <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-cyber-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        バックアップ管理
      </h2>

      <p className="text-sm text-gray-400 font-body mb-6">
        全トーナメントデータをエクスポート・復元できます
      </p>

      {/* メッセージ表示 */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg font-body text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* エクスポートボタン */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          disabled={isExporting}
          className="
            p-4 rounded-lg border-2 border-cyber-accent/30
            bg-gradient-to-br from-cyber-accent/10 to-transparent
            hover:border-cyber-accent/60 hover:from-cyber-accent/20
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all
          "
        >
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-cyber-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="font-display font-bold text-white">
              {isExporting ? 'エクスポート中...' : 'エクスポート'}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-body">
            全データをJSON形式でダウンロード
          </p>
        </motion.button>

        {/* インポートボタン */}
        <motion.label
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            p-4 rounded-lg border-2 border-yellow-500/30
            bg-gradient-to-br from-yellow-500/10 to-transparent
            hover:border-yellow-500/60 hover:from-yellow-500/20
            ${isRestoring ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            transition-all
          `}
        >
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span className="font-display font-bold text-white">
              {isRestoring ? '復元中...' : 'インポート'}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-body">
            バックアップファイルから復元
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            disabled={isRestoring}
            className="hidden"
          />
        </motion.label>
      </div>

      {/* 注意事項 */}
      <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-xs text-yellow-400 font-body">
            <p className="font-bold mb-1">注意事項</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-400/80">
              <li>インポートすると既存データは上書きされます</li>
              <li>重要なデータは定期的にエクスポートしてください</li>
              <li>自動バックアップは毎日午前2時に実行されます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
