import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { ConversationList } from '../components/chat/ConversationList.jsx';
import { ChatWindow } from '../components/chat/ChatWindow.jsx';
import { CustomerDetail } from '../components/chat/CustomerDetail.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useStore } from '../store.js';
import { useSocket } from '../context/SocketContext.jsx';
import { Plus, Bot, UserRound, X, Paperclip, Archive, BellOff } from 'lucide-react';

export default function Inbox() {
  const { user } = useAuth();
  const { socket, joinUser } = useSocket();
  const { setMobileDrawerOpen, mobileDrawerOpen } = useStore();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useEffect(() => {
    loadConversations();
    if (socket && user) joinUser();
    // Socket listeners for typing + new messages
    socket.on('typing', ({ conversationId, user, typing }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: typing ? { user, typing } : null,
      }));
    });
    socket.on('new_message', () => {
      loadConversations();
    });
    return () => {
      socket.off('typing');
      socket.off('new_message');
    };
  }, [socket, user]);

  const loadConversations = async () => {
    try {
      const data = await api.get('/conversations');
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (c) => {
    setSelectedId(c.id);
    setView('chat');
    if (isMobile) setMobileDrawerOpen(false);
  };

  const handleUpdate = async (updates) => {
    if (!selectedId) return;
    try {
      await api.put(`/conversations/${selectedId}`, updates);
      loadConversations();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleArchive = async () => {
    if (!selectedId) return;
    if (!window.confirm('Archive this conversation?')) return;
    try {
      await api.put(`/conversations/${selectedId}`, { status: 'archived' });
      setSelectedId(null);
      setView('list');
      loadConversations();
    } catch (err) {
      console.error('Archive failed', err);
    }
  };

  const handleMarkUnread = async () => {
    if (!selectedId) return;
    try {
      await api.put(`/conversations/${selectedId}`, { unreadCount: 1 });
      loadConversations();
    } catch (err) {
      console.error('Mark unread failed', err);
    }
  };

  const conv = conversations.find((c) => c.id === selectedId);
  const typing = typingUsers[selectedId];

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Desktop: conversation list */}
      {!isMobile && (
        <div className="hidden lg:flex flex-col w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between h-13 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 shrink-0 z-10">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Conversations</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" iconOnly onClick={() => setView('detail') && setSelectedId(null)}>
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" iconOnly onClick={loadConversations}>
                <Archive className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <ConversationList
              conversations={conversations}
              onSelect={handleSelect}
              selectedId={selectedId}
            />
          </div>
        </div>
      )}

      {/* Desktop: chat + detail */}
      {!isMobile && selectedId && conv && (
        <>
          <div className="flex-1 flex flex-col min-w-0">
            <ChatWindow
              conversation={conv}
              typing={typing}
              onArchive={handleArchive}
              onMarkUnread={handleMarkUnread}
            />
          </div>
          <div className="hidden lg:flex flex-col w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CustomerDetail conversation={conv} onUpdate={handleUpdate} />
          </div>
        </>
      )}

      {/* Mobile views */}
      {isMobile && (
        <>
          {view === 'list' && (
            <div className="lg:hidden flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between h-13 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 shrink-0 z-10">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Conversations</h2>
                <Button variant="ghost" size="sm" iconOnly onClick={() => setMobileDrawerOpen(true)}>
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <UserRound className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                  </div>
                </Button>
              </div>
              <div className="flex-1">
                <ConversationList
                  conversations={conversations}
                  onSelect={handleSelect}
                  selectedId={selectedId}
                />
              </div>
            </div>
          )}
          {view === 'chat' && conv && (
            <div className="lg:hidden flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between h-13 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 shrink-0 z-10">
                <Button variant="ghost" size="sm" iconOnly onClick={() => setView('list')}>
                  <X className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{conv.customerName}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setView('detail')}>
                    <UserRound className="w-3 h-3 mr-1" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setView('chat')}>
                    <Bot className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <ChatWindow
                  conversation={conv}
                  typing={typing}
                  onArchive={handleArchive}
                  onMarkUnread={handleMarkUnread}
                />
              </div>
            </div>
          )}
          {view === 'detail' && conv && (
            <div className="lg:hidden flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between h-13 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-950 shrink-0 z-10">
                <Button variant="ghost" size="sm" iconOnly onClick={() => setView('chat')}>
                  <X className="w-4 h-4" />
                </Button>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex-1 text-center">Customer details</h2>
                <Button variant="ghost" size="sm" iconOnly onClick={() => setView('chat')}>
                  <Bot className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CustomerDetail conversation={conv} onUpdate={handleUpdate} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
