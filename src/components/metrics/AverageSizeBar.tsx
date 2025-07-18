'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { messageEvents } from '@/lib/messageEvents';
import { Message } from '@/lib/types';

interface MessageTypeStats {
  type: string;
  totalSize: number;
  count: number;
  averageSize: number;
}

const COLORS = ['#DC2626', '#EA580C', '#2563EB', '#16A34A']; // red, orange, blue, green to match type badges

export const AverageSizeBar = () => {
  const [messageTypeStats, setMessageTypeStats] = useState<MessageTypeStats[]>([]);

  useEffect(() => {
    // Initialize stats for all message types
    const initialStats: MessageTypeStats[] = [
      { type: 'super heavy', totalSize: 0, count: 0, averageSize: 0 },
      { type: 'heavy', totalSize: 0, count: 0, averageSize: 0 },
      { type: 'regular', totalSize: 0, count: 0, averageSize: 0 },
      { type: 'light', totalSize: 0, count: 0, averageSize: 0 },
    ];

    setMessageTypeStats(initialStats);

    // Subscribe to message events
    const unsubscribe = messageEvents.subscribe((message: Message) => {
      setMessageTypeStats(prevStats => {
        const newStats = [...prevStats];
        const typeIndex = newStats.findIndex(item => item.type === message.type);
        
        if (typeIndex !== -1) {
          const currentStat = newStats[typeIndex];
          const newTotalSize = currentStat.totalSize + message.size;
          const newCount = currentStat.count + 1;
          const newAverageSize = newTotalSize / newCount;
          
          newStats[typeIndex] = {
            ...currentStat,
            totalSize: newTotalSize,
            count: newCount,
            averageSize: newAverageSize
          };
        }
        
        return newStats;
      });
    });

    return unsubscribe;
  }, []);

  // Add a key to force re-render when data changes
  const chartKey = messageTypeStats.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${data.type}`}</p>
          <p className="text-sm text-gray-600">{`Average Size: ${data.averageSize.toFixed(2)}`}</p>
          <p className="text-sm text-gray-600">{`Total Size: ${data.totalSize}`}</p>
          <p className="text-sm text-gray-600">{`Count: ${data.count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 h-96 bg-white border border-gray-200 rounded-lg shadow-xs p-4">
      <h3 className="text-md font-semibold mb-4 text-gray-800">Average Size by Message Type</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart key={chartKey} data={messageTypeStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="type" 
            tick={{ fontSize: 0 }}
            angle={0}
            textAnchor="middle"
            height={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: '', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <Tooltip isAnimationActive={false} content={<CustomTooltip />} />
          <Bar 
            dataKey="averageSize" 
            fill="#8884d8"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          >
            {messageTypeStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 