import { Tournament } from './types';

/**
 * バックアップデータの形式
 */
export interface BackupData {
  version: string; // バックアップ形式のバージョン
  createdAt: string; // バックアップ作成日時（ISO 8601）
  metadata: {
    totalTournaments: number;
    totalParticipants: number;
    appVersion: string;
  };
  tournaments: Tournament[];
}

/**
 * バックアップデータを作成
 */
export function createBackupData(tournaments: Tournament[]): BackupData {
  const totalParticipants = tournaments.reduce(
    (sum, t) => sum + t.totalParticipants,
    0
  );

  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    metadata: {
      totalTournaments: tournaments.length,
      totalParticipants,
      appVersion: '1.0.0',
    },
    tournaments,
  };
}

/**
 * バックアップデータのバリデーション
 */
export function validateBackupData(data: unknown): {
  valid: boolean;
  error?: string;
  data?: BackupData;
} {
  try {
    // 基本的な型チェック
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'バックアップデータが不正です' };
    }

    const backup = data as Partial<BackupData>;

    // 必須フィールドの存在チェック
    if (!backup.version || !backup.createdAt || !backup.metadata || !backup.tournaments) {
      return { valid: false, error: '必須フィールドが不足しています' };
    }

    // バージョンチェック
    if (backup.version !== '1.0.0') {
      return {
        valid: false,
        error: `サポートされていないバックアップバージョンです: ${backup.version}`,
      };
    }

    // tournamentsが配列かチェック
    if (!Array.isArray(backup.tournaments)) {
      return { valid: false, error: 'トーナメントデータが不正です' };
    }

    // 各トーナメントの基本構造チェック
    for (const tournament of backup.tournaments) {
      if (
        !tournament.id ||
        !tournament.name ||
        !tournament.createdAt ||
        !tournament.format ||
        typeof tournament.totalParticipants !== 'number' ||
        !tournament.tournamentData ||
        !Array.isArray(tournament.participants)
      ) {
        return {
          valid: false,
          error: `トーナメントデータが不正です: ${tournament.name || '不明'}`,
        };
      }
    }

    return { valid: true, data: backup as BackupData };
  } catch (error) {
    return {
      valid: false,
      error: `バリデーションエラー: ${error instanceof Error ? error.message : '不明なエラー'}`,
    };
  }
}

/**
 * バックアップファイル名を生成
 */
export function generateBackupFilename(prefix: string = 'moderator-battle-backup'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${prefix}-${year}-${month}-${day}-${hours}${minutes}${seconds}.json`;
}
