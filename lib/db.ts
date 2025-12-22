import { Pool } from 'pg';
import { Tournament, Participant, TournamentData } from './types';

// PostgreSQL接続プール
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  return pool;
}

// データベース初期化
export async function initDatabase() {
  try {
    const pool = getPool();

    await pool.query(`
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
    `);

    // インデックス作成
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tournaments_created_at
      ON tournaments(created_at DESC)
    `);

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// 全トーナメント取得
export async function getAllTournaments(): Promise<Tournament[]> {
  try {
    const pool = getPool();

    const result = await pool.query(`
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
    `);

    return result.rows;
  } catch (error) {
    console.error('Get all tournaments error:', error);
    throw error;
  }
}

// ID でトーナメント取得
export async function getTournamentById(id: string): Promise<Tournament | null> {
  try {
    const pool = getPool();

    const result = await pool.query(
      `
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
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
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
    const pool = getPool();

    const result = await pool.query(
      `
        INSERT INTO tournaments (
          name,
          format,
          total_participants,
          tournament_data,
          participants
        )
        VALUES ($1, $2, $3, $4, $5)
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
      `,
      [
        name,
        tournamentData.format,
        tournamentData.totalParticipants,
        JSON.stringify(tournamentData),
        JSON.stringify(participants),
      ]
    );

    return result.rows[0];
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
    const pool = getPool();
    let result;

    if (winnerData) {
      // 優勝者がいる場合、completed_atをNOW()に設定
      result = await pool.query(
        `
          UPDATE tournaments
          SET
            tournament_data = $1,
            winner_data = $2,
            completed_at = NOW()
          WHERE id = $3
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
        `,
        [JSON.stringify(tournamentData), JSON.stringify(winnerData), id]
      );
    } else {
      // 優勝者がいない場合、completed_atはNULLのまま
      result = await pool.query(
        `
          UPDATE tournaments
          SET
            tournament_data = $1,
            winner_data = NULL
          WHERE id = $2
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
        `,
        [JSON.stringify(tournamentData), id]
      );
    }

    return result.rows[0];
  } catch (error) {
    console.error('Update tournament error:', error);
    throw error;
  }
}

// トーナメント削除
export async function deleteTournament(id: string): Promise<void> {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM tournaments WHERE id = $1', [id]);
  } catch (error) {
    console.error('Delete tournament error:', error);
    throw error;
  }
}
