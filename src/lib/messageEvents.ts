import { Message } from './types';

type MessageHandler = (message: Message) => void;

class MessageEventSystem {
  private handlers: Set<MessageHandler> = new Set();

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    
    // unsubscribe function
    return () => {
      this.handlers.delete(handler);
    };
  }

  broadcast(message: Message) {
    this.handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }
}

// singleton
export const messageEvents = new MessageEventSystem(); 