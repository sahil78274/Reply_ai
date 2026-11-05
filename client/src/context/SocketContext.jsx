import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useStore } from '../store.js';
import { playNotificationSound } from '../services/audio.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export function SocketProvider({ children, token }) {
  const socketRef = useRef(null);
  const { addNotification, markRead, unreadNotifications, soundEnabled } = useStore();

  useEffect(() => {
    if (!token) return;
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[ReplyAI] Socket connected');
    });

    socket.on('notification', (payload) => {
      const isNewMsg = payload.type === 'new_message';
      addNotification({
        title: payload.title || 'New message',
        body: payload.body || 'You have a new WhatsApp message',
        type: payload.type,
        conversationId: payload.conversationId,
        data: payload,
      });
      if (soundEnabled) playNotificationSound();
      // Mark conversation unread via store is handled by API refresh
    });

    socket.on('ai_status_changed', (payload) => {
      addNotification({
        title: 'AI automation changed',
        body: payload.aiEnabled ? 'AI resumed for this conversation' : 'AI paused — human takeover active',
        type: 'ai_status',
        conversationId: payload.conversationId,
      });
    });

    socket.on('disconnect', () => {
      console.log('[ReplyAI] Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, addNotification, soundEnabled]);

  const joinUser = () => {
    if (socketRef.current) socketRef.current.emit('join:user', token);
  };

  const joinConversation = (conversationId) => {
    if (socketRef.current) socketRef.current.emit('join:conversation', conversationId);
    useStore.setState({ selectedConversationId: conversationId });
  };

  const leaveConversation = (conversationId) => {
    if (socketRef.current) socketRef.current.emit('leave:conversation', conversationId);
  };

  const sendMessage = (conversationId, message) => {
    if (socketRef.current) {
      socketRef.current.emit('new_message', { conversationId, message });
    }
  };

  const value = {
    socket: socketRef.current,
    joinUser,
    joinConversation,
    leaveConversation,
    sendMessage,
    markRead,
    unreadNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
