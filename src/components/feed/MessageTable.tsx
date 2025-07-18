"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/lib/types";
import { messageEvents } from "@/lib/messageEvents";

const getTypeStyles = (type: string) => {
    switch (type) {
        case 'super heavy':
            return 'bg-red-100 text-red-800';
        case 'heavy':
            return 'bg-orange-100 text-orange-800';
        case 'regular':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-green-100 text-green-800';
    }
};

const getTypeFlashStyles = (type: string) => {
    switch (type) {
        case 'super heavy':
            return 'bg-red-50';
        case 'heavy':
            return 'bg-orange-50';
        case 'regular':
            return 'bg-blue-50';
        default:
            return 'bg-green-50';
    }
};

const truncateLongString = (str: string) => {
    return `${str.substring(0, 8)}...${str.substring(str.length - 8)}`;
};

export default function MessageTable() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newRowId, setNewRowId] = useState<string | null>(null);

    // subscribe to msg events
    useEffect(() => {
        const unsubscribe = messageEvents.subscribe((message) => {
            setNewRowId(message.id);
            setMessages(prev => [message, ...prev]);

            setTimeout(() => {
                setNewRowId(null);
            }, 500);
        });

        return unsubscribe;
    }, []);

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border mb-4">
                <div className="grid grid-cols-5 gap-4 px-6 py-3 text-xs font-medium text-gray-900">
                    <div>ID</div>
                    <div>Timestamp</div>
                    <div>Type</div>
                    <div>Hash</div>
                    <div>Size</div>
                </div>
            </div>

            <div className="relative">
                {messages.length === 0 ? (
                    <div
                        className="bg-white rounded-lg border p-12 text-center"
                    >
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-500">Messages will appear here when they are received from the Websocket connection.</p>
                    </div>
                ) : (
                    <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-hide">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ 
                                        opacity: 0, 
                                        y: -10, 
                                        backgroundColor: newRowId === message.id ? getTypeFlashStyles(message.type) : 'rgb(255, 255, 255)'
                                    }}
                                    animate={{ 
                                        opacity: 1, 
                                        y: 0, 
                                        backgroundColor: 'rgb(255, 255, 255)'
                                    }}
                                    transition={{ 
                                        duration: 0.2,
                                        ease: "easeOut",
                                    }}
                                    className="bg-white rounded-lg border hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className="grid grid-cols-5 gap-4 px-6 py-4">
                                        <div className="text-xs text-gray-900">{truncateLongString(message.id)}</div>
                                        <div className="text-xs text-gray-600">
                                            {message.timestamp}
                                        </div>
                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyles(message.type)}`}>
                                                {message.type}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {truncateLongString(message.hash)}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {message.size.toLocaleString()} bytes
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {messages.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
            </div>

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;  /* Internet Explorer 10+ */
                    scrollbar-width: none;  /* Firefox */
                }
                .scrollbar-hide::-webkit-scrollbar { 
                    display: none;  /* Safari and Chrome */
                }
            `}</style>
        </div>
    );
}