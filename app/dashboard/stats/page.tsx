'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OverviewCard from '@/components/stats/OverviewCard';
import RankingTable from '@/components/stats/RankingTable';
import TournamentChart from '@/components/stats/TournamentChart';
import { OverviewStats, ParticipantStats, TimelineData } from '@/lib/stats-calculator';

interface StatsData {
  overview: OverviewStats;
  timeline: TimelineData[];
  participants: ParticipantStats[];
  rankings: {
    byWins: ParticipantStats[];
    byWinRate: ParticipantStats[];
    byTotalFrames: ParticipantStats[];
    byAvgFrames: ParticipantStats[];
  };
}

export default function StatsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);

      const [overviewRes, participantsRes] = await Promise.all([
        fetch('/api/stats/overview'),
        fetch('/api/stats/participants'),
      ]);

      const overviewData = await overviewRes.json();
      const participantsData = await participantsRes.json();

      setStats({
        overview: overviewData.overview,
        timeline: overviewData.timeline,
        participants: participantsData.participants,
        rankings: participantsData.rankings,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen cyber-grid-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16"
        >
          <svg viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#6366f1"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="60 200"
              opacity="0.8"
            />
          </svg>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen cyber-grid-bg">
      {/* ヘッダー */}
      <header className="header-gradient border-b border-cyber-accent/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard')}
              className="
                p-2 rounded-lg
                bg-cyber-card border border-cyber-accent/30
                text-gray-300 hover:text-white
                hover:border-cyber-accent/60
                transition-all
              "
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </motion.button>

            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl md:text-4xl font-bold text-white"
              >
                統計・分析
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-body text-sm text-gray-500 mt-1"
              >
                トーナメント全体の統計データ
              </motion.p>
            </div>
          </div>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {!stats ? (
          <p className="text-center text-gray-500 font-body">統計データの読み込みに失敗しました</p>
        ) : (
          <div className="space-y-8">
            {/* 概要カード */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-display text-xl text-white mb-4">全体統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OverviewCard
                  title="トーナメント総数"
                  value={stats.overview.totalTournaments}
                  subtitle={`完了: ${stats.overview.completedTournaments}`}
                />
                <OverviewCard
                  title="総参加者数"
                  value={stats.overview.totalParticipants}
                  subtitle="ユニーク参加者"
                />
                <OverviewCard
                  title="総対戦数"
                  value={stats.overview.totalMatches}
                />
                <OverviewCard
                  title="平均参加者数"
                  value={stats.overview.avgParticipantsPerTournament}
                  subtitle="1トーナメントあたり"
                />
                <OverviewCard
                  title="平均ラウンド数"
                  value={stats.overview.avgRoundsPerTournament}
                  subtitle="1トーナメントあたり"
                />
              </div>
            </motion.section>

            {/* グラフ */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TournamentChart data={stats.timeline} />
            </motion.section>

            {/* ランキング */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-xl text-white mb-4">ランキング</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RankingTable
                  title="優勝回数ランキング"
                  data={stats.rankings.byWins}
                  sortBy="wins"
                />
                <RankingTable
                  title="勝率ランキング"
                  data={stats.rankings.byWinRate}
                  sortBy="winRate"
                />
                <RankingTable
                  title="総獲得枠数ランキング"
                  data={stats.rankings.byTotalFrames}
                  sortBy="totalFrames"
                />
                <RankingTable
                  title="平均枠数ランキング"
                  data={stats.rankings.byAvgFrames}
                  sortBy="avgFrames"
                />
              </div>
            </motion.section>
          </div>
        )}
      </div>
    </main>
  );
}
