import { NextResponse } from 'next/server';
import { getAllTournaments } from '@/lib/db';
import {
  calculateParticipantStats,
  createRankings,
} from '@/lib/stats-calculator';

export async function GET() {
  try {
    const tournaments = await getAllTournaments();

    const participantStats = calculateParticipantStats(tournaments);
    const rankings = createRankings(participantStats);

    return NextResponse.json({
      success: true,
      participants: participantStats,
      rankings,
    });
  } catch (error) {
    console.error('Participant stats error:', error);
    return NextResponse.json(
      { success: false, error: '参加者統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
