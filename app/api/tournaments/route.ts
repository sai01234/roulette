import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllTournaments, createTournament, initDatabase } from '@/lib/db';
import { Participant, TournamentData } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET - 全トーナメント取得（公開API - 認証不要）
export async function GET() {
  try {
    // データベース初期化（テーブルがない場合）
    await initDatabase();

    const tournaments = await getAllTournaments();
    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('Get tournaments error:', error);
    return NextResponse.json(
      { error: 'トーナメントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST - 新規トーナメント作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { name, participants, tournamentData } = await request.json();

    // バリデーション
    if (!name || !participants || !tournamentData) {
      return NextResponse.json(
        { error: '必要なデータが不足しています' },
        { status: 400 }
      );
    }

    // データベース初期化（テーブルがない場合）
    await initDatabase();

    const tournament = await createTournament(
      name,
      participants as Participant[],
      tournamentData as TournamentData
    );

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    console.error('Create tournament error:', error);
    return NextResponse.json(
      { error: 'トーナメントの作成に失敗しました' },
      { status: 500 }
    );
  }
}
