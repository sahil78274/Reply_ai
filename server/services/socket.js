/**
 * Socket.IO setup for real-time dashboard notifications.
 */
import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
    });
    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

export const emitToConversation = (conversationId, event, payload) => {
  if (io) io.to(`conv:${conversationId}`).emit(event, payload);
};

export const emitNewMessage = (userId, conversationId, message, conversation) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      type: 'new_message',
      message,
      conversation,
      timestamp: new Date().toISOString(),
    });
    io.to(`conv:${conversationId}`).emit('new_message', message);
  }
};
