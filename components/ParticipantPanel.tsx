'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '@/lib/types';

interface ParticipantPanelProps {
  participants: Participant[];
  onReset: () => void;
  hasStarted: boolean;
}

export default function ParticipantPanel({ participants, onReset, hasStarted }: ParticipantPanelProps) {
  const totalFrames = participants.reduce((sum, p) => sum + p.frames, 0);

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-cyber-accent flex items-center gap-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          参加者一覧
        </h2>
        <span className="px-3 py-1 rounded-full bg-cyber-accent/20 text-cyber-accent font-display text-sm">
          {participants.length}名
        </span>
      </div>

      {/* 統計 */}
      {participants.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-cyber-card/50 border border-cyber-accent/20">
            <p className="text-xs text-gray-400 font-body">総枠数</p>
            <p className="text-xl font-display text-cyber-accent2">{totalFrames}</p>
          </div>
          <div className="p-3 rounded-lg bg-cyber-card/50 border border-cyber-accent/20">
            <p className="text-xs text-gray-400 font-body">シード</p>
            <p className="text-xl font-display text-cyber-gold">
              {participants.filter(p => p.isSeed).length}名
            </p>
          </div>
        </div>
      )}

      {/* 参加者リスト */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {participants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-40 text-gray-500"
            >
              <svg className="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="font-body text-sm">CSVファイルをアップロードして</p>
              <p className="font-body text-sm">参加者を追加してください</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className={`
                    p-3 rounded-lg border transition-all duration-200
                    ${participant.isSeed 
                      ? 'bg-cyber-gold/10 border-cyber-gold/50' 
                      : 'bg-cyber-card/50 border-cyber-accent/10 hover:border-cyber-accent/30'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-display
                        ${participant.isSeed 
                          ? 'bg-cyber-gold/20 text-cyber-gold' 
                          : 'bg-cyber-accent/20 text-cyber-accent'
                        }
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-body font-medium text-white">{participant.name}</p>
                        {participant.isSeed && (
                          <span className="text-xs text-cyber-gold font-display">SEED</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-cyber-accent2/20 text-cyber-accent2 text-sm font-display">
                        {participant.frames}枠
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* リセットボタン */}
      {(participants.length > 0 || hasStarted) && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onReset}
          className="mt-4 w-full py-3 rounded-lg border border-red-500/50 text-red-400 
            font-display text-sm hover:bg-red-500/10 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            トーナメントをリセット
          </span>
        </motion.button>
      )}
    </div>
  );
}

