"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function WsInputSection() {
  const [url, setUrl] = useState("");

  const { isConnected, isConnecting, error, connect, disconnect, clearError } = useWebSocket();

  const handleConnectClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect(url);
    }
  };

  const getStatusColor = () => {
    if (error) return "bg-red-500";
    if (isConnecting) return "bg-yellow-500";
    if (isConnected) return "bg-green-500";
    return "bg-red-500";
  };

  const createGlowStyle = (r: number, g: number, b: number) => {
    return {
      boxShadow: `0 0 4px 1px rgba(${r}, ${g}, ${b}, 0.8), 0 0 8px 2px rgba(${r}, ${g}, ${b}, 0.6), 0 0 16px 4px rgba(${r}, ${g}, ${b}, 0.4), 0 0 24px 6px rgba(${r}, ${g}, ${b}, 0.2), 0 0 28px 8px rgba(${r}, ${g}, ${b}, 0.1)`
    };
  };

  const getGlowStyle = () => { // yellow, green, red
    if (error) return createGlowStyle(239, 68, 68);
    if (isConnecting) return createGlowStyle(234, 179, 8);
    if (isConnected) return createGlowStyle(34, 197, 94);
    return createGlowStyle(239, 68, 68);
  };

  const getStatusText = () => {
    if (error) return "Error";
    if (isConnecting) return "Connecting...";
    if (isConnected) return "Connected";
    return "Disconnected";
  };

  return (
    <>
      <div className="flex gap-6 items-center mb-2">
        <h1 className="text-2xl font-bold">Websocket Dashboard</h1>
        <div className="flex items-center gap-2">
          <div 
            className={`w-1.5 h-1.5 rounded-full ${getStatusColor()} animate-pulse`}
            style={getGlowStyle()}
          ></div>
          <span className="text-xs font-medium text-gray-500">{getStatusText()}</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-700 font-medium">Connection Error</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      <div className="flex w-full gap-4">
        <Input 
          type="text" 
          placeholder="ws://..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isConnecting}
        />
        <Button 
          className="cursor-pointer"
          onClick={handleConnectClick}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </>
  );
}