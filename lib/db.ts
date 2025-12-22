import { sql } from '@vercel/postgres';
import { Tournament, Participant, TournamentData } from './types';

// データベース初期化
export async function initDatabase() {
  try {
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
    const result = await sql<Tournament>`
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

    return result.rows;
  } catch (error) {
    console.error('Get all tournaments error:', error);
    throw error;
  }
}

// ID でトーナメント取得
export async function getTournamentById(id: string): Promise<Tournament | null> {
  try {
    const result = await sql<Tournament>`
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
    const result = await sql<Tournament>`
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
    let result;

    if (winnerData) {
      // 優勝者がいる場合、completed_atをNOW()に設定
      result = await sql<Tournament>`
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
      result = await sql<Tournament>`
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

    return result.rows[0];
  } catch (error) {
    console.error('Update tournament error:', error);
    throw error;
  }
}

// トーナメント削除
export async function deleteTournament(id: string): Promise<void> {
  try {
    await sql`DELETE FROM tournaments WHERE id = ${id}`;
  } catch (error) {
    console.error('Delete tournament error:', error);
    throw error;
  }
}
