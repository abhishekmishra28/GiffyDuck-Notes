import { api } from './axios';
import type {
  ChatResponse,
  ChatsResponse,
  ChatHistoryResponse,
  AIStreamResponse,
  AISuggestionInput,
  AISuggestionResponse,
} from '@/types/chat';

interface SendMessageInput {
  query: string;
  chatId: string;
}

export const aiApi = {
  sendMessage: (data: SendMessageInput) =>
    api.post<AIStreamResponse>('/ai/message', data).then((res) => res.data),

  getChatHistory: () =>
    api.get<ChatHistoryResponse>('/ai/history').then((res) => res.data),

  createChat: () =>
    api.post<ChatResponse>('/ai/chats').then((res) => res.data),

  getChats: () =>
    api.get<ChatsResponse>('/ai/chats').then((res) => res.data),

  getChatById: (chatId: string) =>
    api
      .get<ChatHistoryResponse>(`/ai/chats/${chatId}`)
      .then((res) => res.data),

  suggestForNote: (data: AISuggestionInput) =>
    api
      .post<AISuggestionResponse>('/ai/note/suggest', data)
      .then((res) => res.data),
};

export function sendMessageStream(
  query: string,
  chatId: string,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
) {
  const token = localStorage.getItem('token');
  const url = `http://localhost:5000/api/ai/message/stream`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, chatId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      function read(): Promise<void> {
        return reader!.read().then(({ done, value }) => {
          if (done) {
            onDone();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6);
              if (data === '[DONE]') {
                onDone();
                return;
              }
              onChunk(data.replace(/\\n/g, '\n'));
            }
          }

          return read();
        });
      }

      return read();
    })
    .catch((error) => {
      onError(error instanceof Error ? error : new Error(String(error)));
    });
}
