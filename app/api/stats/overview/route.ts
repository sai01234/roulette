import { NextResponse } from 'next/server';
import { getAllTournaments } from '@/lib/db';
import {
  calculateOverviewStats,
  calculateTimeline,
} from '@/lib/stats-calculator';

export async function GET() {
  try {
    const tournaments = await getAllTournaments();

    const overview = calculateOverviewStats(tournaments);
    const timeline = calculateTimeline(tournaments);

    return NextResponse.json({
      success: true,
      overview,
      timeline,
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    return NextResponse.json(
      { success: false, error: '統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
