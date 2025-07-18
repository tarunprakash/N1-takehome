'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { messageEvents } from '../../lib/messageEvents';
import { Message } from '../../lib/types';

interface DataPoint {
  time: string;
  messagesPerSecond: number;
}

export default function MessageRateChart() {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);

  useEffect(() => {
    const unsubscribe = messageEvents.subscribe((message: Message) => {
      setRecentMessages(prev => {
        const now = Date.now();
        const oneSecondAgo = now - 1000;
        const updated = [...prev, message];
        const recent = updated.filter(msg => msg.timestamp >= oneSecondAgo);
        return recent;
      });
    });

    return unsubscribe;
  }, []);

  // Calculate messages per second and update chart data
  useEffect(() => {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Count messages that arrived in the last second
    const messagesInLastSecond = recentMessages.filter(msg => msg.timestamp >= oneSecondAgo).length;
    
    // Create time label (HH:MM:SS format)
    const date = new Date();
    const timeLabel = date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    setChartData(prev => {
      const newDataPoint = { time: timeLabel, messagesPerSecond: messagesInLastSecond };
      const updated = [...prev, newDataPoint];
      
      // Keep only last 30 data points to prevent chart from getting too wide
      return updated.slice(-30);
    });
  }, [recentMessages]);

  // Clean up old messages periodically to prevent memory leaks
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentMessages(prev => {
        const now = Date.now();
        const oneSecondAgo = now - 1000;
        return prev.filter(msg => msg.timestamp >= oneSecondAgo);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xs p-4 w-1/3">
      <h3 className="text-md font-semibold text-gray-900 mb-4">Messages per Second</h3>
      <div className="flex h-full">
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tick={{ fontSize: 10 }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
              labelStyle={{ color: '#374151' }}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="messagesPerSecond" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 