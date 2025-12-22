import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 環境変数チェック
    const hasPostgresUrl = !!process.env.POSTGRES_URL;
    const originalUrl = process.env.POSTGRES_URL?.substring(0, 50) || 'NOT_SET';

    // 変換後の接続文字列を取得
    let transformedUrl = 'NOT_TRANSFORMED';
    if (process.env.POSTGRES_URL) {
      let connectionString = process.env.POSTGRES_URL;
      if (connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
        connectionString = connectionString.replace('postgres://', 'postgresql://');
      }
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
      transformedUrl = connectionString.substring(0, 70);
    }

    // データベース接続テスト
    let dbConnectionTest = 'NOT_TESTED';
    let tableExists = false;
    let errorDetails = null;

    if (hasPostgresUrl) {
      try {
        const sql = neon(process.env.POSTGRES_URL!);

        // 簡単なクエリでデータベース接続をテスト
        const result = await sql`SELECT NOW() as current_time`;
        dbConnectionTest = 'SUCCESS';

        // tournamentsテーブルの存在確認
        const tableCheck = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'tournaments'
          ) as exists
        `;
        tableExists = tableCheck[0]?.exists || false;
      } catch (error: any) {
        dbConnectionTest = 'FAILED';
        errorDetails = {
          message: error.message,
          code: error.code,
          detail: error.detail,
        };
      }
    }

    return NextResponse.json({
      environment: {
        hasPostgresUrl,
        originalUrl,
        transformedUrl,
      },
      database: {
        connectionTest: dbConnectionTest,
        tableExists,
        errorDetails,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
