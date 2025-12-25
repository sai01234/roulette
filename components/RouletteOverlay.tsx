'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match, Participant } from '@/lib/types';
import { determineWinner, calculateWinProbabilities } from '@/lib/tournament-manager';
import { audioManager } from '@/lib/audio-manager';

interface RouletteOverlayProps {
  match: Match;
  onConfirmWinner: (winnerId: string) => void;
  onCancel: () => void;
}

type Phase = 'preview' | 'spinning' | 'result';

// ルーレットの色パレット
const COLORS = [
  '#ff3366', // cyber-accent
  '#00ffcc', // cyber-accent2
  '#9333ea', // cyber-purple
  '#3b82f6', // cyber-blue
  '#ffd700', // cyber-gold
  '#ef4444', // red
  '#22c55e', // green
  '#f97316', // orange
];

export default function RouletteOverlay({ match, onConfirmWinner, onCancel }: RouletteOverlayProps) {
  const [phase, setPhase] = useState<Phase>('preview');
  const [winner, setWinner] = useState<Participant | null>(null);
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(0);

  const participants = match.participants.filter(p => !p.isSpecialOpponent);
  const isDoubleMatch = match.participants.some(p => p.isSpecialOpponent);
  const probabilities = calculateWinProbabilities(match.participants);

  // セグメントを計算
  const segments = match.participants.map((p, i) => {
    const prob = probabilities.get(p.id) || 0;
    return {
      participant: p,
      probability: prob,
      angle: prob * 360,
      color: COLORS[i % COLORS.length],
    };
  });

  // SVGパスを生成
  const generateArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(200, 200, radius, endAngle);
    const end = polarToCartesian(200, 200, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      'M', 200, 200,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  // ルーレット開始
  const startRoulette = useCallback(() => {
    setPhase('spinning');

    // 効果音を再生
    audioManager.play('roulette-spin', 0.5);

    // 勝者を決定
    const selectedWinner = determineWinner(match.participants);
    setWinner(selectedWinner);

    // 勝者のセグメント位置を計算
    let accumulatedAngle = 0;
    let winnerMidAngle = 0;
    
    for (const seg of segments) {
      if (seg.participant.id === selectedWinner.id) {
        winnerMidAngle = accumulatedAngle + seg.angle / 2;
        break;
      }
      accumulatedAngle += seg.angle;
    }

    // 回転量を計算（8回転 + 調整）
    const spins = 8;
    const targetAngle = spins * 360 + (360 - winnerMidAngle);
    setTargetRotation(targetAngle);

    // 5秒後に結果表示
    setTimeout(() => {
      setPhase('result');
    }, 5000);
  }, [match.participants, segments]);

  // スキップ
  const skipRoulette = () => {
    if (phase === 'spinning') {
      setPhase('result');
    }
  };

  // 結果確定
  const confirmResult = () => {
    if (winner) {
      onConfirmWinner(winner.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl mx-4 p-8 rounded-2xl 
          bg-gradient-to-br from-cyber-card to-cyber-bg border border-cyber-accent/30
          shadow-2xl shadow-cyber-accent/20"
      >
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl text-white mb-2">
            {isDoubleMatch ? '🎯 2倍チャレンジ 🎯' : '⚔️ 対戦開始 ⚔️'}
          </h2>
          <p className="text-gray-400 font-body">
            {phase === 'preview' && 'ルーレットを回して勝者を決定します'}
            {phase === 'spinning' && '回転中...'}
            {phase === 'result' && '勝者が決定しました！'}
          </p>
        </div>

        {/* 参加者情報 */}
        <div className="flex justify-center gap-8 mb-8">
          {match.participants.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ x: i === 0 ? -50 : 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
              className={`
                text-center p-4 rounded-xl border-2 transition-all
                ${phase === 'result' && winner?.id === p.id
                  ? 'border-cyber-gold bg-cyber-gold/20 scale-110'
                  : 'border-cyber-accent/30 bg-cyber-card/50'
                }
              `}
            >
              <div
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <p className="font-display text-lg text-white">{p.name}</p>
              <p className="font-body text-sm text-cyber-accent2">
                {p.frames}枠 ({((probabilities.get(p.id) || 0) * 100).toFixed(1)}%)
              </p>
            </motion.div>
          ))}
        </div>

        {/* ルーレット */}
        <div className="relative flex justify-center mb-8">
          {/* 矢印インジケーター */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <svg width="30" height="40" viewBox="0 0 30 40">
              <path
                d="M15 40 L0 15 L15 0 L30 15 Z"
                fill="#ffd700"
                className="drop-shadow-lg"
              />
            </svg>
          </div>

          {/* ルーレット本体 */}
          <motion.svg
            width="300"
            height="300"
            viewBox="0 0 400 400"
            animate={{ rotate: phase === 'spinning' ? targetRotation : rotation }}
            transition={{
              duration: phase === 'spinning' ? 5 : 0,
              ease: [0.2, 0.8, 0.2, 1],
            }}
            className="drop-shadow-2xl"
          >
            {/* 外枠 */}
            <circle
              cx="200"
              cy="200"
              r="195"
              fill="none"
              stroke="url(#borderGradient)"
              strokeWidth="6"
            />
            
            {/* グラデーション定義 */}
            <defs>
              <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff3366" />
                <stop offset="50%" stopColor="#00ffcc" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>

            {/* セグメント */}
            {(() => {
              let currentAngle = 0;
              return segments.map((seg, i) => {
                const path = generateArcPath(currentAngle, currentAngle + seg.angle, 180);
                const midAngle = currentAngle + seg.angle / 2;
                const labelPos = polarToCartesian(200, 200, 120, midAngle);
                currentAngle += seg.angle;

                return (
                  <g key={seg.participant.id}>
                    <path
                      d={path}
                      fill={seg.color}
                      stroke="#0a0a1a"
                      strokeWidth="2"
                      className="transition-all duration-300"
                      style={{
                        filter: phase === 'result' && winner?.id === seg.participant.id
                          ? 'brightness(1.3) drop-shadow(0 0 20px rgba(255,215,0,0.8))'
                          : 'none'
                      }}
                    />
                    {seg.angle > 20 && (
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        className="font-display pointer-events-none"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        {seg.participant.name.slice(0, 6)}
                      </text>
                    )}
                  </g>
                );
              });
            })()}

            {/* 中心円 */}
            <circle
              cx="200"
              cy="200"
              r="30"
              fill="#0a0a1a"
              stroke="#ff3366"
              strokeWidth="3"
            />
            <text
              x="200"
              y="200"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ff3366"
              fontSize="12"
              fontWeight="bold"
              className="font-display"
            >
              VS
            </text>
          </motion.svg>
        </div>

        {/* 結果表示 */}
        <AnimatePresence>
          {phase === 'result' && winner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <p className="text-cyber-gold font-display text-2xl mb-2">🏆 勝者 🏆</p>
              <p className="text-white font-display text-4xl">{winner.name}</p>
              {isDoubleMatch ? (
                <p className="text-cyber-accent2 font-body mt-2">
                  枠数が2倍に！ {winner.frames} → {winner.frames * 2}
                </p>
              ) : (
                <p className="text-cyber-accent2 font-body mt-2">
                  敗者の枠数を吸収！
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ボタン */}
        <div className="flex justify-center gap-4">
          {phase === 'preview' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRoulette}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-cyber-accent to-cyber-purple 
                  text-white font-display text-lg shadow-lg shadow-cyber-accent/30"
              >
                🎰 ルーレット開始
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-8 py-3 rounded-lg border border-gray-600 text-gray-400 
                  font-display text-lg hover:bg-gray-800/50"
              >
                キャンセル
              </motion.button>
            </>
          )}

          {phase === 'spinning' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipRoulette}
              className="px-8 py-3 rounded-lg border border-cyber-accent/50 text-cyber-accent 
                font-display text-lg hover:bg-cyber-accent/10"
            >
              スキップ →
            </motion.button>
          )}

          {phase === 'result' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmResult}
              className="px-12 py-4 rounded-lg bg-gradient-to-r from-cyber-gold to-yellow-500 
                text-black font-display text-xl shadow-lg shadow-cyber-gold/30"
            >
              ✓ 確定
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

