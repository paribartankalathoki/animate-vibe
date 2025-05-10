export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isTyping?: boolean;
}
