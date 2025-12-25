import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { list } from '@vercel/blob';

export const dynamic = 'force-dynamic';

/**
 * バックアップ一覧取得
 * GET /api/backup/list
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // Blob Storageからバックアップ一覧を取得
    const { blobs } = await list({ prefix: 'backups/' });

    // 日付順にソート（新しい順）
    const sortedBlobs = blobs.sort((a, b) => {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    // レスポンス用に整形
    const backups = sortedBlobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return NextResponse.json({ backups });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'バックアップ一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
