'use client';

import { motion } from 'framer-motion';
import { Tournament } from '@/lib/types';
import { getRelativeTime } from '@/lib/dashboard-stats';
import { useRouter } from 'next/navigation';

interface RecentTournamentsSectionProps {
  tournaments: Tournament[];
}

export default function RecentTournamentsSection({ tournaments }: RecentTournamentsSectionProps) {
  const router = useRouter();

  if (tournaments.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
        <svg className="w-6 h-6 text-cyber-accent" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        最近のトーナメント
      </h2>

      <div className="space-y-3">
        {tournaments.map((tournament, index) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push(`/tournament/${tournament.id}`)}
            className="panel p-4 cursor-pointer hover:border-cyber-accent/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display text-lg text-white">{tournament.name}</h3>
                  {tournament.completedAt ? (
                    <span className="px-2 py-1 rounded text-xs font-body bg-green-500/20 text-green-400 border border-green-500/50">
                      完了
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-body bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                      進行中
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm font-body text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {tournament.totalParticipants}名
                  </span>

                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {getRelativeTime(tournament.createdAt)}
                  </span>

                  {tournament.completedAt && tournament.winnerData && (
                    <span className="flex items-center gap-1 text-cyber-gold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {tournament.winnerData.name}
                    </span>
                  )}
                </div>
              </div>

              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
