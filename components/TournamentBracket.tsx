'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TournamentData, Match, Participant } from '@/lib/types';

interface TournamentBracketProps {
  tournamentData: TournamentData;
  onMatchClick: (match: Match) => void;
  onSeedAdvance: (match: Match) => void;
}

export default function TournamentBracket({ 
  tournamentData, 
  onMatchClick, 
  onSeedAdvance 
}: TournamentBracketProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getRoundName = (roundNumber: number, totalRounds: number): string => {
    const remaining = totalRounds - roundNumber;
    if (remaining === 0) return '決勝';
    if (remaining === 1) return '準決勝';
    if (remaining === 2) return '準々決勝';
    return `Round ${roundNumber}`;
  };

  const getMatchStatusStyle = (match: Match): string => {
    switch (match.status) {
      case 'completed':
        return 'border-green-500/50 bg-green-500/10';
      case 'ready':
        return 'border-cyber-accent/50 bg-cyber-accent/10 cursor-pointer hover:border-cyber-accent hover:bg-cyber-accent/20';
      case 'in_progress':
        return 'border-yellow-500/50 bg-yellow-500/10';
      default:
        return 'border-gray-600/30 bg-gray-800/30';
    }
  };

  const handleMatchClick = (match: Match) => {
    // 完了済みの試合はクリックできない
    if (match.status === 'completed') {
      return;
    }

    // 参加者が1人の場合は自動進出処理
    if (match.participants.length === 1) {
      onSeedAdvance(match);
    } else if (match.status === 'ready') {
      // 通常の対戦
      onMatchClick(match);
    }
  };

  const getParticipantDisplay = (participant: Participant, isWinner: boolean) => {
    return (
      <div
        className={`
          flex items-center justify-between px-3 py-2 rounded transition-all
          ${isWinner ? 'bg-cyber-gold/20 text-cyber-gold' : 'text-gray-300'}
          ${participant.isSeed ? 'ring-1 ring-cyber-gold/30' : ''}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          {participant.isSeed && (
            <span className="text-xs text-cyber-gold">★</span>
          )}
          <span className="truncate font-body text-sm">
            {participant.isSpecialOpponent ? '🎯 2倍' : participant.name}
          </span>
        </div>
        <span className="text-xs font-display text-cyber-accent2 ml-2 flex-shrink-0">
          {participant.frames}枠
        </span>
      </div>
    );
  };

  if (!tournamentData || tournamentData.rounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-body">
        トーナメントデータがありません
      </div>
    );
  }

  return (
    <div ref={containerRef} className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max p-4">
        {tournamentData.rounds.map((round, roundIndex) => (
          <div key={round.roundNumber} className="flex flex-col">
            {/* ラウンドヘッダー */}
            <div className="text-center mb-4">
              <span className="px-4 py-1 rounded-full bg-cyber-accent/20 text-cyber-accent font-display text-sm">
                {getRoundName(round.roundNumber, tournamentData.rounds.length)}
              </span>
            </div>

            {/* 対戦カード */}
            <div 
              className="flex flex-col justify-around flex-1 gap-4"
              style={{ minHeight: `${Math.max(200, round.matches.length * 100)}px` }}
            >
              {round.matches.map((match, matchIndex) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: roundIndex * 0.1 + matchIndex * 0.05 }}
                  onClick={() => handleMatchClick(match)}
                  className={`
                    relative w-64 rounded-lg border-2 overflow-hidden transition-all duration-200
                    ${getMatchStatusStyle(match)}
                  `}
                >
                  {/* 対戦番号 */}
                  <div className="absolute top-1 right-2 text-xs text-gray-500 font-display">
                    #{roundIndex + 1}-{matchIndex + 1}
                  </div>

                  {/* 参加者表示 */}
                  <div className="p-2 space-y-1">
                    {match.participants.length === 0 ? (
                      <div className="py-4 text-center text-gray-500 font-body text-sm">
                        待機中...
                      </div>
                    ) : match.participants.length === 1 ? (
                      <>
                        {getParticipantDisplay(match.participants[0], match.status === 'completed')}
                        <div className="py-2 text-center">
                          {match.status === 'completed' ? (
                            <span className="text-green-400 text-xs font-display">
                              自動進出（枠数2倍）
                            </span>
                          ) : (
                            <span className="text-cyber-accent text-xs font-display animate-pulse">
                              クリックして進出
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {match.participants.map((p, i) => (
                          <div key={p.id}>
                            {getParticipantDisplay(p, match.winner === p.id)}
                            {i < match.participants.length - 1 && (
                              <div className="text-center text-xs text-cyber-accent font-display py-1">
                                VS
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* ステータスインジケーター */}
                  {match.status === 'ready' && match.participants.length >= 2 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-accent to-cyber-purple animate-pulse" />
                  )}

                  {match.status === 'completed' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* 優勝者表示 */}
        {tournamentData.winner && (
          <div className="flex flex-col">
            <div className="text-center mb-4">
              <span className="px-4 py-1 rounded-full bg-cyber-gold/30 text-cyber-gold font-display text-sm">
                優勝
              </span>
            </div>
            <div className="flex-1 flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-64 p-6 rounded-xl border-2 border-cyber-gold bg-gradient-to-br from-cyber-gold/20 to-yellow-500/10 text-center"
              >
                <div className="text-4xl mb-2">🏆</div>
                <p className="font-display text-2xl text-cyber-gold mb-2">
                  {tournamentData.winner.name}
                </p>
                <p className="font-body text-sm text-cyber-accent2">
                  最終枠数: {tournamentData.winner.frames}
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

