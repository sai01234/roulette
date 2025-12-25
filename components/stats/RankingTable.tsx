'use client';

import { motion } from 'framer-motion';
import { ParticipantStats } from '@/lib/stats-calculator';

interface RankingTableProps {
  title: string;
  data: ParticipantStats[];
  sortBy: 'wins' | 'winRate' | 'totalFrames' | 'avgFrames';
}

export default function RankingTable({ title, data, sortBy }: RankingTableProps) {
  const getValueDisplay = (stat: ParticipantStats) => {
    switch (sortBy) {
      case 'wins':
        return `${stat.wins}勝`;
      case 'winRate':
        return `${stat.winRate}%`;
      case 'totalFrames':
        return `${stat.totalFrames}枠`;
      case 'avgFrames':
        return `${stat.avgFrames}枠`;
    }
  };

  return (
    <div className="panel p-6">
      <h3 className="font-display text-xl text-white mb-4">{title}</h3>

      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-8 font-body">データがありません</p>
      ) : (
        <div className="space-y-2">
          {data.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                flex items-center justify-between p-3 rounded-lg
                bg-cyber-card border border-cyber-accent/20
                hover:border-cyber-accent/50 transition-colors
              "
            >
              <div className="flex items-center gap-3">
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    font-display font-bold text-sm
                    ${index === 0 ? 'bg-cyber-gold text-black' : ''}
                    ${index === 1 ? 'bg-gray-400 text-black' : ''}
                    ${index === 2 ? 'bg-orange-600 text-white' : ''}
                    ${index >= 3 ? 'bg-cyber-card text-gray-500' : ''}
                  `}
                >
                  {index + 1}
                </span>
                <span className="font-body text-white">{stat.name}</span>
              </div>
              <span className="font-display text-cyber-accent">{getValueDisplay(stat)}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
