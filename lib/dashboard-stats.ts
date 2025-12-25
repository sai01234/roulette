import { Tournament } from './types';

export interface MonthlyStats {
  tournamentsThisMonth: number;
  participantsThisMonth: number;
  avgParticipantsThisMonth: number;
  comparedToLastMonth: {
    tournaments: number; // 増減率（%）
    participants: number;
  };
}

/**
 * 月次統計を計算
 */
export function calculateMonthlyStats(
  currentMonthTournaments: Tournament[],
  lastMonthTournaments: Tournament[]
): MonthlyStats {
  // 今月の統計
  const tournamentsThisMonth = currentMonthTournaments.length;
  const participantsThisMonth = currentMonthTournaments.reduce(
    (sum, t) => sum + t.totalParticipants,
    0
  );
  const avgParticipantsThisMonth =
    tournamentsThisMonth > 0 ? Math.round(participantsThisMonth / tournamentsThisMonth) : 0;

  // 先月の統計
  const tournamentsLastMonth = lastMonthTournaments.length;
  const participantsLastMonth = lastMonthTournaments.reduce(
    (sum, t) => sum + t.totalParticipants,
    0
  );

  // 増減率の計算（パーセント）
  const tournamentsChange =
    tournamentsLastMonth > 0
      ? Math.round(
          ((tournamentsThisMonth - tournamentsLastMonth) / tournamentsLastMonth) * 100
        )
      : tournamentsThisMonth > 0
      ? 100
      : 0;

  const participantsChange =
    participantsLastMonth > 0
      ? Math.round(
          ((participantsThisMonth - participantsLastMonth) / participantsLastMonth) * 100
        )
      : participantsThisMonth > 0
      ? 100
      : 0;

  return {
    tournamentsThisMonth,
    participantsThisMonth,
    avgParticipantsThisMonth,
    comparedToLastMonth: {
      tournaments: tournamentsChange,
      participants: participantsChange,
    },
  };
}

/**
 * 相対時間を計算（例：「2日前」）
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMonth > 0) {
    return `${diffMonth}ヶ月前`;
  } else if (diffWeek > 0) {
    return `${diffWeek}週間前`;
  } else if (diffDay > 0) {
    return `${diffDay}日前`;
  } else if (diffHour > 0) {
    return `${diffHour}時間前`;
  } else if (diffMin > 0) {
    return `${diffMin}分前`;
  } else {
    return 'たった今';
  }
}
