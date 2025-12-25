import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllTournaments } from '@/lib/db';
import { createBackupData, generateBackupFilename } from '@/lib/backup';

export const dynamic = 'force-dynamic';

/**
 * 手動エクスポート - 全トーナメントをJSON形式でダウンロード
 * GET /api/backup/export
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 全トーナメント取得
    const tournaments = await getAllTournaments();

    // バックアップデータ作成
    const backupData = createBackupData(tournaments);

    // JSON文字列に変換（整形あり）
    const jsonString = JSON.stringify(backupData, null, 2);

    // ファイル名生成
    const filename = generateBackupFilename();

    // レスポンス作成
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'エクスポートに失敗しました' },
      { status: 500 }
    );
  }
}
