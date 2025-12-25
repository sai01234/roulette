'use client';

import { motion } from 'framer-motion';

interface OverviewCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function OverviewCard({ title, value, subtitle, icon }: OverviewCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="panel p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm text-gray-500 font-body">{title}</h3>
        {icon && <div className="text-cyber-accent">{icon}</div>}
      </div>
      <p className="font-display text-3xl text-white mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-600 font-body">{subtitle}</p>
      )}
    </motion.div>
  );
}
