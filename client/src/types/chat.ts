export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessage {
  _id?: string;
  role: ChatMessageRole;
  content: string;
  createdAt?: string;
}

export interface Chat {
  _id: string;
  user: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatResponse {
  success: boolean;
  chat: Chat;
}

export interface ChatsResponse {
  success: boolean;
  chats: Chat[];
}

export interface ChatHistoryResponse {
  success: boolean;
  messages: ChatMessage[];
}

export interface AIStreamResponse {
  success: boolean;
  response: string;
}

export interface AISuggestionInput {
  noteId: string;
  action: string;
  text?: string;
  tone?: string;
}

export interface AISuggestionResponse {
  success: boolean;
  suggestion: string;
}
