import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import { getAllTournaments } from '@/lib/db';
import { createBackupData, generateBackupFilename } from '@/lib/backup';

export const dynamic = 'force-dynamic';

/**
 * 自動バックアップ（Cron Job経由で実行）
 * GET /api/backup/auto
 */
export async function GET(request: NextRequest) {
  try {
    // Cron Secretの検証（セキュリティ）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 全トーナメント取得
    const tournaments = await getAllTournaments();

    // バックアップデータ作成
    const backupData = createBackupData(tournaments);

    // Vercel Blob Storageにアップロード
    const filename = generateBackupFilename('auto-backup');
    const blob = await put(`backups/${filename}`, JSON.stringify(backupData, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log('Auto backup created:', blob.url);

    // 30日以上前のバックアップを削除
    await cleanupOldBackups();

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename,
      tournaments: tournaments.length,
    });
  } catch (error) {
    console.error('Auto backup error:', error);
    return NextResponse.json(
      { error: '自動バックアップに失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 古いバックアップを削除（30日以上前）
 */
async function cleanupOldBackups() {
  try {
    const { blobs } = await list({ prefix: 'backups/' });

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const blob of blobs) {
      const uploadedAt = new Date(blob.uploadedAt).getTime();
      if (uploadedAt < thirtyDaysAgo) {
        await del(blob.url);
        console.log('Deleted old backup:', blob.pathname);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    // クリーンアップのエラーは致命的ではないので続行
  }
}
