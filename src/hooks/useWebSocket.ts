import { useState, useRef, useCallback, useEffect } from "react";
import { messageEvents } from "@/lib/messageEvents";
import { Message } from "@/lib/types";

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (url: string) => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  clearError: () => void;
  reconnectAttempts: number;
}

interface ReconnectConfig {
  enabled: boolean;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

const validateData = (data: any): Message | null => {
    try {
        const parsedData = JSON.parse(data);
            
        // message structure
        if (!parsedData.id || !parsedData.timestamp || !parsedData.type || !parsedData.hash || typeof parsedData.size !== 'number') {
            console.warn('Invalid message structure:', parsedData);
            return null;
        }

        // message type
        const validTypes: Message['type'][] = ['super heavy', 'heavy', 'regular', 'light'];
        if (!validTypes.includes(parsedData.type)) {
            console.warn('Invalid message type:', parsedData.type);
            return null;
        }

        const message: Message = {
            id: parsedData.id,
            timestamp: parsedData.timestamp,
            type: parsedData.type,
            hash: parsedData.hash,
            size: parsedData.size,
        };

        return message;
    } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        return null;
    }
}

export const useWebSocket = (reconnectConfig: ReconnectConfig = {
  enabled: true,
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 30000
}): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const urlRef = useRef<string>('');
  const reconnectAttemptsRef = useRef(0);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const calculateReconnectDelay = useCallback((attempt: number): number => {
    const delay = Math.min(
      reconnectConfig.baseDelay * Math.pow(2, attempt),
      reconnectConfig.maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }, [reconnectConfig]);

  const attemptReconnect = useCallback(() => {
    if (!reconnectConfig.enabled || !urlRef.current || reconnectAttemptsRef.current >= reconnectConfig.maxAttempts) {
      if (reconnectAttemptsRef.current >= reconnectConfig.maxAttempts) {
        const errorMsg = `Failed to reconnect after ${reconnectConfig.maxAttempts} attempts`;
        setError(errorMsg);
        console.error(errorMsg);
      }
      return;
    }

    const delay = calculateReconnectDelay(reconnectAttemptsRef.current);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${reconnectConfig.maxAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      setReconnectAttempts(reconnectAttemptsRef.current);
      connect(urlRef.current);
    }, delay);
  }, [reconnectConfig, calculateReconnectDelay]);

  const connect = useCallback((url: string) => {
    if (!url.trim()) {
      const errorMsg = "Please enter a WebSocket URL";
      setError(errorMsg);
      console.error(errorMsg);
      return;
    }
    
    // Validate URL format before attempting connection
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'ws:' && urlObj.protocol !== 'wss:') {
        const errorMsg = "Invalid WebSocket URL. Must start with 'ws://' or 'wss://'";
        setError(errorMsg);
        console.error(errorMsg);
        return;
      }
    } catch (error) {
      const errorMsg = "Invalid URL format. Please enter a valid WebSocket URL";
      setError(errorMsg);
      console.error(errorMsg);
      return;
    }

    // Store URL for reconnection attempts
    urlRef.current = url;
    
    // Reset reconnect attempts if this is a fresh connection
    if (reconnectAttemptsRef.current === 0) {
      setReconnectAttempts(0);
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        // Reset reconnect attempts on successful connection
        reconnectAttemptsRef.current = 0;
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        const message = validateData(event.data);
        if (message) {
          messageEvents.broadcast(message);
        }
        else {
          console.log('Invalid message:', event.data);
          setError('Received invalid message: ' + event.data);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected", event);
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
        
        // Attempt reconnect if not a clean close and reconnect is enabled
        if (!event.wasClean && reconnectConfig.enabled) {
          attemptReconnect();
        }
      };

      ws.onerror = (error) => {
        console.log("WebSocket error:", error);
        setIsConnecting(false);
        setIsConnected(false);
        wsRef.current = null;
        
        const errorMsg = "Failed to connect to WebSocket server";
        setError(errorMsg);
      };

    } catch (error) {
      const errorMsg = "Failed to create WebSocket connection";
      console.error(errorMsg, error);
      setIsConnecting(false);
      setError(errorMsg);
      
      // Attempt reconnect on connection creation failure
      if (reconnectConfig.enabled) {
        attemptReconnect();
      }
    }
  }, [reconnectConfig.enabled, attemptReconnect]);

  const disconnect = useCallback(() => {
    // Clear any pending reconnect attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Reset reconnect state
    reconnectAttemptsRef.current = 0;
    setReconnectAttempts(0);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setError(null);
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(message);
    } else {
      const errorMsg = "WebSocket is not connected";
      console.error(errorMsg);
      setError(errorMsg);
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendMessage,
    clearError,
    reconnectAttempts,
  };
}; 