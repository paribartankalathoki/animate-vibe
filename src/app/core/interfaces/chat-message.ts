export interface ChatMessage {
  sender: string;
  text: string;
  id: string;
  isTyping?: boolean;
  pairIndex?: number;
  active?: boolean;
  completed?: boolean;
}
