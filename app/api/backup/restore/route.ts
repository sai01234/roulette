import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { createTournament } from '@/lib/db';
import { validateBackupData } from '@/lib/backup';

export const dynamic = 'force-dynamic';

/**
 * バックアップから復元
 * POST /api/backup/restore
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディ取得
    const body = await request.json();

    // バックアップデータのバリデーション
    const validation = validateBackupData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'バックアップデータが不正です' },
        { status: 400 }
      );
    }

    const backupData = validation.data!;

    // トーナメントを順番にインポート
    let imported = 0;
    const errors: string[] = [];

    for (const tournament of backupData.tournaments) {
      try {
        await createTournament(
          tournament.name,
          tournament.participants,
          tournament.tournamentData
        );
        imported++;
      } catch (error) {
        console.error(`Failed to import tournament: ${tournament.name}`, error);
        errors.push(`${tournament.name}: インポート失敗`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      total: backupData.tournaments.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: '復元に失敗しました' },
      { status: 500 }
    );
  }
}
