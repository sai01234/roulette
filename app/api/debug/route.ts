import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 環境変数チェック
    const hasPostgresUrl = !!process.env.POSTGRES_URL;
    const postgresUrlPrefix = process.env.POSTGRES_URL?.substring(0, 30) || 'NOT_SET';

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
        postgresUrlPrefix,
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
