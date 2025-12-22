'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { processCSV, parseCSVFile } from '@/lib/csv-processor';
import { Participant, CSVProcessResult } from '@/lib/types';

interface CSVImportProps {
  onImport: (participants: Participant[]) => void;
  disabled?: boolean;
}

export default function CSVImport({ onImport, disabled }: CSVImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイル形式チェック
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('CSVファイル形式のみ対応しています');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setWarnings([]);

    try {
      const csvText = await parseCSVFile(file);
      const result: CSVProcessResult = processCSV(csvText);

      if (!result.success) {
        setError(result.errors?.join('\n') || 'インポートに失敗しました');
      } else if (result.participants) {
        if (result.warnings) {
          setWarnings(result.warnings);
        }
        onImport(result.participants);
      }
    } catch (err) {
      setError('ファイルの読み込みに失敗しました');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      
      <motion.button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isProcessing}
        className="w-full relative overflow-hidden rounded-lg px-6 py-4 font-display text-lg font-bold 
          bg-gradient-to-r from-cyber-accent to-cyber-purple text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-cyber-accent/30"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {isProcessing ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              処理中...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              参加者を追加（CSV）
            </>
          )}
        </span>
        
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyber-purple to-cyber-accent"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm"
          >
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <pre className="whitespace-pre-wrap font-body">{error}</pre>
            </div>
          </motion.div>
        )}

        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-sm"
          >
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="font-body">
                {warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-xs text-gray-500 font-body">
        <p>CSVファイル形式: <code className="text-cyber-accent2">参加者名,枠数</code></p>
        <p>例: 参加者A,5</p>
      </div>
    </div>
  );
}

