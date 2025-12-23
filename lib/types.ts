// 参加者データ
export interface Participant {
  id: string;
  name: string;
  frames: number;
  isSeed: boolean;
  isSpecialOpponent?: boolean;
}

// 対戦データ
export interface Match {
  id: string;
  participants: Participant[];
  winner: string | null;
  status: MatchStatus;
  matchIndex: number;
}

// 対戦状態
export type MatchStatus = 'pending' | 'ready' | 'in_progress' | 'completed';

// ラウンドデータ
export interface Round {
  roundNumber: number;
  matches: Match[];
}

// トーナメントデータ
export interface TournamentData {
  rounds: Round[];
  winner: Participant | null;
  format: TournamentFormat;
  totalParticipants: number;
}

// トーナメント形式
export type TournamentFormat = '1v1' | '3way';

// トーナメント状態
export interface TournamentState {
  participants: Participant[];
  tournamentData: TournamentData | null;
  isInitialized: boolean;
}

// CSV処理結果
export interface CSVProcessResult {
  success: boolean;
  participants?: Participant[];
  errors?: string[];
  warnings?: string[];
}

// ルーレット結果
export interface RouletteResult {
  winnerId: string;
  winnerName: string;
  rotation: number;
}

// トーナメント（複数管理用）
export interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  completedAt: string | null;
  format: TournamentFormat;
  totalParticipants: number;
  winnerData: Participant | null;
  tournamentData: TournamentData;
  participants: Participant[];
}

// セッションデータ
export interface SessionData {
  isLoggedIn: boolean;
  username?: string;
}

