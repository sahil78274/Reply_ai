import { useState, useEffect, useRef } from 'react';
import { Send, Bot, UserRound, AlertCircle, Paperclip, Eye, Archive, BellOff } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { api } from '../../services/api.js';
import { MessageBubble } from './MessageBubble.jsx';
import { AiStatusBanner } from './AiStatusBanner.jsx';
import { formatTime } from '../../lib/utils.js';
import { cn } from '../../lib/utils.js';

export function ChatWindow({ conversation: convProp, typing, onArchive, onMarkUnread }) {
  const { conversationId } = useParams();
  const { token } = useAuth();
  const { socket, joinConversation, leaveConversation } = useSocket();
  const [conversation, setConversation] = useState(convProp || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const activeId = conversationId || (conversation ? conversation.id : null);

  useEffect(() => {
    if (!activeId) return;
    joinConversation(activeId);
    load();
    return () => leaveConversation(activeId);
  }, [activeId]);

  useEffect(() => {
    if (convProp) setConversation(convProp);
  }, [convProp]);

  const load = async () => {
    try {
      const data = await api.get(`/conversations/${activeId}`);
      setConversation(data.conversation);
      setMessages(data.messages);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
    }
  };

  const scrollBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await api.post('/messages/send', { conversationId: activeId, content: input.trim() });
      setInput('');
      load();
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTakeover = async () => {
    try {
      await api.put(`/conversations/${activeId}/takeover`);
      load();
    } catch (err) {
      setError(err.message || 'Takeover failed');
    }
  };

  const handleResume = async () => {
    try {
      await api.put(`/conversations/${activeId}/resume-ai`);
      load();
    } catch (err) {
      setError(err.message || 'Failed to resume AI');
    }
  };

  const handleTyping = () => {
    if (socket && activeId) {
      socket.emit('typing', { conversationId: activeId, typing: true });
    }
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-6">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={load} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
        <Bot className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 relative">
      <div className="flex items-center justify-between h-13 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/inbox')}>
          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold">
            {conversation.source === 'demo' ? 'bg-slate-200 text-slate-600' : 'bg-brand-100 text-brand-700'}
            {conversation.customerName ? conversation.customerName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{conversation.customerName}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              {conversation.source === 'demo' ? 'Demo conversation' : 'WhatsApp'}
              {conversation.customerPhone ? ` • ${conversation.customerPhone}` : ''}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={conversation.source === 'demo' ? 'outline' : 'success'} className="h-6 text-xs">
            {conversation.source === 'demo' ? 'Demo mode' : 'Live'}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {conversation.aiEnabled || conversation.humanTakeover ? (
          <AiStatusBanner
            aiEnabled={conversation.aiEnabled}
            humanTakeover={conversation.humanTakeover}
            onTakeover={handleTakeover}
            onResume={handleResume}
          />
        ) : null}

        <div className="flex flex-col gap-3" ref={messagesEndRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-12 text-slate-400 dark:text-slate-500">
              <Bot className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))
          )}
          {typing && (
            <div className="flex items-center gap-2 ml-3 mb-2 animate-pulse">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">{typing.user} is typing…</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shrink-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none pr-12"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleTyping}
              disabled={sending}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              onClick={() => {}}
              disabled={sending}
            >
              <Paperclip className="w-4 h-4 text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 -mr-8"
              onClick={() => {}}
              disabled={sending}
            >
              <Eye className="w-4 h-4 text-slate-500" />
            </Button>
          </div>
          <Button variant="primary" size="sm" disabled={sending || !input.trim()} onClick={handleSend} type="button">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {sending && <span className="animate-pulse">Sending…</span>}
            {!sending && input.trim() && <span>Ready to send</span>}
          </div>
          <div className="flex gap-1">
            {onArchive && (
              <Button variant="danger" size="sm" onClick={onArchive} className="h-8">
                <Archive className="w-3 h-3 mr-1" />
                Archive
              </Button>
            )}
            {onMarkUnread && (
              <Button variant="outline" size="sm" onClick={onMarkUnread} className="h-8">
                <BellOff className="w-3 h-3 mr-1" />
                Unread
              </Button>
            )}
          </div>
        </div>
        {sending && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Sending…</p>
        )}
      </div>
    </div>
  );
}

