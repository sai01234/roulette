import postgres from 'postgres';
import { Tournament, Participant, TournamentData } from './types';

// PostgreSQL client instance (singleton)
let sql: ReturnType<typeof postgres> | null = null;

// Get PostgreSQL client
function getSql() {
  if (sql) return sql;

  // POSTGRES_URLが設定されている場合
  if (process.env.POSTGRES_URL) {
    let connectionString = process.env.POSTGRES_URL;

    // postgres:// を postgresql:// に変換
    if (connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
      connectionString = connectionString.replace('postgres://', 'postgresql://');
    }

    // Session Poolerが必要（ポート6543）
    if (connectionString.includes(':5432/')) {
      connectionString = connectionString
        .replace(/db\.([a-zA-Z0-9]+)\.supabase\.co:5432/, 'aws-1-ap-northeast-1.pooler.supabase.com:6543')
        .replace(/:5432\//, ':6543/');

      const projectIdMatch = connectionString.match(/pooler\.supabase\.com/);
      if (projectIdMatch) {
        connectionString = connectionString.replace(
          /postgresql:\/\/postgres:/,
          'postgresql://postgres.bgfqbfhlzyvbtrigxurc:'
        );
      }
    }

    sql = postgres(connectionString, {
      max: 1, // Vercel serverlessでは接続プールを小さく
      idle_timeout: 20,
      connect_timeout: 10,
    });

    return sql;
  }

  throw new Error('POSTGRES_URL is not set');
}

// データベース初期化
export async function initDatabase() {
  try {
    const sql = getSql();

    await sql`
      CREATE TABLE IF NOT EXISTS tournaments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        format TEXT NOT NULL,
        total_participants INTEGER NOT NULL,
        winner_data JSONB,
        tournament_data JSONB NOT NULL,
        participants JSONB NOT NULL
      )
    `;

    // インデックス作成
    await sql`
      CREATE INDEX IF NOT EXISTS idx_tournaments_created_at
      ON tournaments(created_at DESC)
    `;

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// 全トーナメント取得
export async function getAllTournaments(): Promise<Tournament[]> {
  try {
    const sql = getSql();

    const result = await sql`
      SELECT
        id::text,
        name,
        created_at::text as "createdAt",
        completed_at::text as "completedAt",
        format,
        total_participants as "totalParticipants",
        winner_data as "winnerData",
        tournament_data as "tournamentData",
        participants
      FROM tournaments
      ORDER BY created_at DESC
    `;

    return result as Tournament[];
  } catch (error) {
    console.error('Get all tournaments error:', error);
    throw error;
  }
}

// ID でトーナメント取得
export async function getTournamentById(id: string): Promise<Tournament | null> {
  try {
    const sql = getSql();

    const result = await sql`
      SELECT
        id::text,
        name,
        created_at::text as "createdAt",
        completed_at::text as "completedAt",
        format,
        total_participants as "totalParticipants",
        winner_data as "winnerData",
        tournament_data as "tournamentData",
        participants
      FROM tournaments
      WHERE id = ${id}
    `;

    return result[0] as Tournament || null;
  } catch (error) {
    console.error('Get tournament by ID error:', error);
    throw error;
  }
}

// トーナメント作成
export async function createTournament(
  name: string,
  participants: Participant[],
  tournamentData: TournamentData
): Promise<Tournament> {
  try {
    const sql = getSql();

    const result = await sql`
      INSERT INTO tournaments (
        name,
        format,
        total_participants,
        tournament_data,
        participants
      )
      VALUES (
        ${name},
        ${tournamentData.format},
        ${tournamentData.totalParticipants},
        ${JSON.stringify(tournamentData)},
        ${JSON.stringify(participants)}
      )
      RETURNING
        id::text,
        name,
        created_at::text as "createdAt",
        completed_at::text as "completedAt",
        format,
        total_participants as "totalParticipants",
        winner_data as "winnerData",
        tournament_data as "tournamentData",
        participants
    `;

    return result[0] as Tournament;
  } catch (error) {
    console.error('Create tournament error:', error);
    throw error;
  }
}

// トーナメント更新（対戦結果など）
export async function updateTournament(
  id: string,
  tournamentData: TournamentData,
  winnerData: Participant | null = null
): Promise<Tournament> {
  try {
    const sql = getSql();
    let result;

    if (winnerData) {
      // 優勝者がいる場合、completed_atをNOW()に設定
      result = await sql`
        UPDATE tournaments
        SET
          tournament_data = ${JSON.stringify(tournamentData)},
          winner_data = ${JSON.stringify(winnerData)},
          completed_at = NOW()
        WHERE id = ${id}
        RETURNING
          id::text,
          name,
          created_at::text as "createdAt",
          completed_at::text as "completedAt",
          format,
          total_participants as "totalParticipants",
          winner_data as "winnerData",
          tournament_data as "tournamentData",
          participants
      `;
    } else {
      // 優勝者がいない場合、completed_atはNULLのまま
      result = await sql`
        UPDATE tournaments
        SET
          tournament_data = ${JSON.stringify(tournamentData)},
          winner_data = NULL
        WHERE id = ${id}
        RETURNING
          id::text,
          name,
          created_at::text as "createdAt",
          completed_at::text as "completedAt",
          format,
          total_participants as "totalParticipants",
          winner_data as "winnerData",
          tournament_data as "tournamentData",
          participants
      `;
    }

    return result[0] as Tournament;
  } catch (error) {
    console.error('Update tournament error:', error);
    throw error;
  }
}

// トーナメント削除
export async function deleteTournament(id: string): Promise<void> {
  try {
    const sql = getSql();
    await sql`DELETE FROM tournaments WHERE id = ${id}`;
  } catch (error) {
    console.error('Delete tournament error:', error);
    throw error;
  }
}
