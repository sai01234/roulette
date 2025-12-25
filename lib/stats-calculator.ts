import { Tournament, Participant, Match } from './types';

export interface ParticipantStats {
  name: string;
  totalTournaments: number;
  wins: number;
  totalMatches: number;
  matchesWon: number;
  winRate: number;
  totalFrames: number;
  avgFrames: number;
}

export interface OverviewStats {
  totalTournaments: number;
  completedTournaments: number;
  totalParticipants: number; // ユニーク
  totalMatches: number;
  avgParticipantsPerTournament: number;
  avgRoundsPerTournament: number;
}

export interface TimelineData {
  month: string;
  tournaments: number;
  participants: number;
}

/**
 * 全体統計を計算
 */
export function calculateOverviewStats(tournaments: Tournament[]): OverviewStats {
  const completedTournaments = tournaments.filter(t => t.completedAt !== null);

  // ユニーク参加者数
  const participantNames = new Set<string>();
  let totalMatches = 0;

  tournaments.forEach(tournament => {
    // 参加者名を収集
    tournament.participants.forEach(p => participantNames.add(p.name));

    // 対戦数をカウント
    tournament.tournamentData.rounds.forEach(round => {
      totalMatches += round.matches.filter(m => m.status === 'completed').length;
    });
  });

  const avgParticipants = tournaments.length > 0
    ? tournaments.reduce((sum, t) => sum + t.totalParticipants, 0) / tournaments.length
    : 0;

  const avgRounds = tournaments.length > 0
    ? tournaments.reduce((sum, t) => sum + t.tournamentData.rounds.length, 0) / tournaments.length
    : 0;

  return {
    totalTournaments: tournaments.length,
    completedTournaments: completedTournaments.length,
    totalParticipants: participantNames.size,
    totalMatches,
    avgParticipantsPerTournament: Math.round(avgParticipants * 10) / 10,
    avgRoundsPerTournament: Math.round(avgRounds * 10) / 10,
  };
}

/**
 * 参加者別統計を計算
 */
export function calculateParticipantStats(tournaments: Tournament[]): ParticipantStats[] {
  const statsMap = new Map<string, ParticipantStats>();

  tournaments.forEach(tournament => {
    tournament.participants.forEach(participant => {
      if (!statsMap.has(participant.name)) {
        statsMap.set(participant.name, {
          name: participant.name,
          totalTournaments: 0,
          wins: 0,
          totalMatches: 0,
          matchesWon: 0,
          winRate: 0,
          totalFrames: 0,
          avgFrames: 0,
        });
      }

      const stats = statsMap.get(participant.name)!;
      stats.totalTournaments++;

      // 優勝チェック
      if (tournament.winnerData?.name === participant.name) {
        stats.wins++;
      }

      // 対戦統計
      tournament.tournamentData.rounds.forEach(round => {
        round.matches.forEach(match => {
          const participantInMatch = match.participants.find(p => p.name === participant.name);
          if (participantInMatch && match.status === 'completed') {
            stats.totalMatches++;
            if (match.winner === participantInMatch.id) {
              stats.matchesWon++;
            }
          }
        });
      });

      // 枠数統計
      stats.totalFrames += participant.frames;
    });
  });

  // 平均値と勝率を計算
  const result: ParticipantStats[] = Array.from(statsMap.values()).map(stats => ({
    ...stats,
    winRate: stats.totalMatches > 0
      ? Math.round((stats.matchesWon / stats.totalMatches) * 1000) / 10
      : 0,
    avgFrames: stats.totalTournaments > 0
      ? Math.round((stats.totalFrames / stats.totalTournaments) * 10) / 10
      : 0,
  }));

  return result;
}

/**
 * 特定参加者の詳細統計を取得
 */
export function getParticipantDetailStats(
  tournaments: Tournament[],
  participantName: string
): ParticipantStats & { tournamentHistory: Array<{ tournamentId: string; tournamentName: string; rank: number; frames: number }> } {
  const allStats = calculateParticipantStats(tournaments);
  const stats = allStats.find(s => s.name === participantName);

  if (!stats) {
    return {
      name: participantName,
      totalTournaments: 0,
      wins: 0,
      totalMatches: 0,
      matchesWon: 0,
      winRate: 0,
      totalFrames: 0,
      avgFrames: 0,
      tournamentHistory: [],
    };
  }

  // トーナメント履歴
  const tournamentHistory = tournaments
    .filter(t => t.participants.some(p => p.name === participantName))
    .map(tournament => {
      const participant = tournament.participants.find(p => p.name === participantName)!;
      const isWinner = tournament.winnerData?.name === participantName;
      const rank = isWinner ? 1 : 0; // 簡易実装（勝者は1位、それ以外は順位なし）

      return {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        rank,
        frames: participant.frames,
      };
    })
    .sort((a, b) => b.frames - a.frames);

  return {
    ...stats,
    tournamentHistory,
  };
}

/**
 * トーナメント数の時系列データを計算
 */
export function calculateTimeline(tournaments: Tournament[]): TimelineData[] {
  const monthMap = new Map<string, { tournaments: number; participants: Set<string> }>();

  tournaments.forEach(tournament => {
    const date = new Date(tournament.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        tournaments: 0,
        participants: new Set(),
      });
    }

    const monthData = monthMap.get(monthKey)!;
    monthData.tournaments++;
    tournament.participants.forEach(p => monthData.participants.add(p.name));
  });

  // マップを配列に変換してソート
  return Array.from(monthMap.entries())
    .map(([month, data]) => ({
      month,
      tournaments: data.tournaments,
      participants: data.participants.size,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * ランキングを作成
 */
export function createRankings(stats: ParticipantStats[]) {
  return {
    byWins: [...stats].sort((a, b) => b.wins - a.wins).slice(0, 10),
    byWinRate: [...stats].filter(s => s.totalMatches >= 3).sort((a, b) => b.winRate - a.winRate).slice(0, 10),
    byTotalFrames: [...stats].sort((a, b) => b.totalFrames - a.totalFrames).slice(0, 10),
    byAvgFrames: [...stats].filter(s => s.totalTournaments >= 2).sort((a, b) => b.avgFrames - a.avgFrames).slice(0, 10),
  };
}
