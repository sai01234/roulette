'use client';

import { motion } from 'framer-motion';
import { MonthlyStats } from '@/lib/dashboard-stats';

interface MonthlyStatsSectionProps {
  stats: MonthlyStats;
}

export default function MonthlyStatsSection({ stats }: MonthlyStatsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      {/* 今月の開催数 */}
      <StatCard
        title="今月の開催数"
        value={stats.tournamentsThisMonth}
        suffix="件"
        change={stats.comparedToLastMonth.tournaments}
        color="cyber-accent"
      />

      {/* 今月の参加者数 */}
      <StatCard
        title="今月の参加者数"
        value={stats.participantsThisMonth}
        suffix="名"
        change={stats.comparedToLastMonth.participants}
        color="cyber-accent2"
      />

      {/* 平均参加者数 */}
      <StatCard
        title="平均参加者数"
        value={stats.avgParticipantsThisMonth}
        suffix="名"
        color="cyber-purple"
      />
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  change?: number;
  color: 'cyber-accent' | 'cyber-accent2' | 'cyber-purple';
}

function StatCard({ title, value, suffix = '', change, color }: StatCardProps) {
  const hasChange = change !== undefined;
  const isIncrease = hasChange && change > 0;
  const isDecrease = hasChange && change < 0;
  const isNoChange = hasChange && change === 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="panel p-6"
    >
      <p className="text-sm text-gray-400 font-body mb-2">{title}</p>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-baseline gap-2"
      >
        <p className={`text-4xl font-display font-bold text-${color}`}>
          {value}
        </p>
        <p className="text-lg text-gray-500 font-body">{suffix}</p>
      </motion.div>

      {/* 先月比 */}
      {hasChange && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 flex items-center gap-2"
        >
          {isIncrease && (
            <>
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-green-400 font-body">
                +{change}% 先月比
              </span>
            </>
          )}
          {isDecrease && (
            <>
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-red-400 font-body">
                {change}% 先月比
              </span>
            </>
          )}
          {isNoChange && (
            <>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-400 font-body">
                変化なし
              </span>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
