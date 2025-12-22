import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getTournamentById, updateTournament } from '@/lib/db';
import { TournamentData, Participant } from '@/lib/types';

// GET - 特定のトーナメント取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const tournament = await getTournamentById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: 'トーナメントが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tournament });
  } catch (error) {
    console.error('Get tournament error:', error);
    return NextResponse.json(
      { error: 'トーナメントの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT - トーナメント更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { tournamentData, winnerData } = await request.json();

    if (!tournamentData) {
      return NextResponse.json(
        { error: 'トーナメントデータが必要です' },
        { status: 400 }
      );
    }

    const tournament = await updateTournament(
      id,
      tournamentData as TournamentData,
      winnerData as Participant | null
    );

    return NextResponse.json({ tournament });
  } catch (error) {
    console.error('Update tournament error:', error);
    return NextResponse.json(
      { error: 'トーナメントの更新に失敗しました' },
      { status: 500 }
    );
  }
}
