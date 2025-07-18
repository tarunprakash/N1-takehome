'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { messageEvents } from '@/lib/messageEvents';
import { Message } from '@/lib/types';

interface MessageTypeCount {
  type: string;
  count: number;
}

const COLORS = ['#DC2626', '#EA580C', '#2563EB', '#16A34A']; // red, orange, blue, green to match type badges

export const MessageFrequencyPie = () => {
  const [messageTypeCounts, setMessageTypeCounts] = useState<MessageTypeCount[]>([]);

  useEffect(() => {
    // Initialize counts for all message types
    const initialCounts: MessageTypeCount[] = [
      { type: 'super heavy', count: 0 },
      { type: 'heavy', count: 0 },
      { type: 'regular', count: 0 },
      { type: 'light', count: 0 },
    ];

    setMessageTypeCounts(initialCounts);

    // Subscribe to message events
    const unsubscribe = messageEvents.subscribe((message: Message) => {
      setMessageTypeCounts(prevCounts => {
        const newCounts = [...prevCounts];
        const typeIndex = newCounts.findIndex(item => item.type === message.type);
        
        if (typeIndex !== -1) {
          newCounts[typeIndex] = {
            ...newCounts[typeIndex],
            count: newCounts[typeIndex].count + 1
          };
        }
        
        return newCounts;
      });
    });

    return unsubscribe;
  }, []);

  // Add a key to force re-render when data changes
  const chartKey = messageTypeCounts.reduce((sum, item) => sum + item.count, 0);

  // Calculate total count for percentage calculation
  const totalCount = messageTypeCounts.reduce((sum, item) => sum + item.count, 0);

  // Custom label function to show both percentage and count
  const renderCustomLabel = (props: any) => {
    const { type, count } = props;
    if (totalCount === 0) return '';
    const percentage = ((count / totalCount) * 100).toFixed(1);
    return `${percentage}%\n(${count})`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalCount > 0 ? ((data.count / totalCount) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${data.type}`}</p>
          <p className="text-sm text-gray-600">{`Count: ${data.count}`}</p>
          <p className="text-sm text-gray-600">{`Percentage: ${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 h-96 bg-white border border-gray-200 rounded-lg shadow-xs p-4">
      <h3 className="text-md font-semibold mb-4 text-gray-800">Message Type Frequency</h3>
      <div className="flex h-full">
        <ResponsiveContainer width="100%" height="90%">
            <PieChart key={chartKey}>
            <Pie
                data={totalCount === 0 ? [{ type: 'empty', count: 1 }] : messageTypeCounts}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
                isAnimationActive={false}
            >
                {totalCount === 0 ? (
                  <Cell key="empty-cell" fill="#f3f4f6" stroke="#d1d5db" strokeWidth={2} />
                ) : (
                  messageTypeCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))
                )}
            </Pie>
            {totalCount > 0 && <Tooltip isAnimationActive={false} content={<CustomTooltip />} />}
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 