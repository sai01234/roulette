'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimelineData } from '@/lib/stats-calculator';

interface TournamentChartProps {
  data: TimelineData[];
}

export default function TournamentChart({ data }: TournamentChartProps) {
  if (data.length === 0) {
    return (
      <div className="panel p-6">
        <p className="text-gray-500 text-center py-8 font-body">データがありません</p>
      </div>
    );
  }

  return (
    <div className="panel p-6">
      <h3 className="font-display text-xl text-white mb-4">トーナメント推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis
            dataKey="month"
            stroke="#888"
            style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
          />
          <YAxis
            stroke="#888"
            style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12122a',
              border: '1px solid #6366f1',
              borderRadius: '8px',
              fontFamily: 'Rajdhani',
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'Rajdhani',
            }}
          />
          <Line
            type="monotone"
            dataKey="tournaments"
            stroke="#6366f1"
            strokeWidth={2}
            name="トーナメント数"
          />
          <Line
            type="monotone"
            dataKey="participants"
            stroke="#fbbf24"
            strokeWidth={2}
            name="参加者数"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
