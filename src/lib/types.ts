export type Message = {
    id: string;               // Unique identifier (e.g. UUID)
    timestamp: number;        // Unix timestamp in milliseconds
    type: 'super heavy' | 'heavy' | 'regular' | 'light';  // Message type
    hash: string;             // Hash of the data
    size: number;             // Size representing a number
  };