'use client';

import { useEffect, useState } from 'react';
import { messageEvents } from '../../lib/messageEvents';
import { Message } from '../../lib/types';

export default function KpiGrid() {
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    const unsubscribe = messageEvents.subscribe((message: Message) => {
      setTotalMessages(prev => prev + 1);
      setTotalSize(prev => prev + message.size);
    });

    return unsubscribe;
  }, []);

  // Format size for display
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full">
        <div className="flex flex-col gap-4 h-full">
            <div className="bg-white border border-gray-200 rounded-lg shadow-xs p-4 h-1/2">
                <div className="flex flex-col h-full">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Total Messages</p>
                    </div>
                    <div className="flex justify-end items-end">
                        <h3 className="text-xl font-semibold text-gray-900">{totalMessages}</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-xs p-4 h-1/2">
                <div className="flex flex-col h-full">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Total Size</p>
                    </div>
                    <div className="flex justify-end items-end">
                        <h3 className="text-xl font-semibold text-gray-900">{formatSize(totalSize)}</h3>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}