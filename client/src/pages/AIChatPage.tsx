import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Send, Loader2, MessageSquare } from 'lucide-react';
import { aiApi, sendMessageStream } from '@/api/ai';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { formatRelativeDate } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

export default function AIChatPage() {
  const { user } = useAuthStore();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatsData, refetch: refetchChats } = useQuery({
    queryKey: ['chats'],
    queryFn: aiApi.getChats,
  });

  const { data: chatData } = useQuery({
    queryKey: ['chat', selectedChatId],
    queryFn: () => aiApi.getChatById(selectedChatId!),
    enabled: !!selectedChatId,
  });

  useEffect(() => {
    if (chatData?.messages) {
      setMessages(chatData.messages);
    }
  }, [chatData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const createChatMutation = useMutation({
    mutationFn: aiApi.createChat,
    onSuccess: (data) => {
      setSelectedChatId(data.chat._id);
      setMessages([]);
      refetchChats();
    },
  });

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    if (!selectedChatId) {
      toast.error('Create or select a chat first');
      return;
    }
    if (input.length > 1000) {
      toast.error('Message too long (max 1000 chars)');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStreaming(true);

    let assistantContent = '';

    sendMessageStream(
      input,
      selectedChatId,
      (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const filtered = prev.filter((m) => !(m.role === 'assistant' && !m._id));
          return [
            ...filtered,
            { role: 'assistant', content: assistantContent },
          ];
        });
      },
      () => {
        setStreaming(false);
        refetchChats();
      },
      (error) => {
        setStreaming(false);
        toast.error(error.message || 'Chat error');
      }
    );
  };

  const chats = chatsData?.chats || [];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Chat list sidebar */}
      <div className="hidden w-64 flex-col gap-2 rounded-xl border border-border bg-card p-3 md:flex">
        <button
          onClick={() => createChatMutation.mutate()}
          disabled={createChatMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>

        <div className="mt-2 flex-1 space-y-1 overflow-auto">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => setSelectedChatId(chat._id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedChatId === chat._id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeDate(chat.updatedAt)}
              </p>
            </button>
          ))}
          {chats.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No chats yet
            </p>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col rounded-xl border border-border bg-card">
        {/* Mobile chat selector */}
        <div className="border-b border-border p-3 md:hidden">
          <select
            value={selectedChatId || ''}
            onChange={(e) => setSelectedChatId(e.target.value || null)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Select a chat...</option>
            {chats.map((chat) => (
              <option key={chat._id} value={chat._id}>
                {chat.title}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedChatId ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                Start a conversation
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a new chat or select an existing one
              </p>
              <button
                onClick={() => createChatMutation.mutate()}
                className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h3 className="text-lg font-medium text-foreground">
                How can I help you today?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask me anything about your notes or general questions
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                AI Usage: {user?.aiUsageCount || 0} / {user?.aiQuota || 50}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          {streaming && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-muted px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {selectedChatId && (
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="max-h-32 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring transition-all placeholder:text-muted-foreground focus:ring-2"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming}
                className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {streaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{input.length}/1000</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
