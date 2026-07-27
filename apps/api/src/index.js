const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/auth.middleware');
const { socketChatRateLimiter } = require('../middleware/rateLimiter.middleware');
const chatService = require('../services/chat.service');

let io;

const initSocket = (server, redisClient) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ─── Auth Middleware ───────────────────────────────────────────
  io.use(authenticateSocket);

  // ─── Connection Handler ────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user._id || user.id;

    console.log(`🔌 Socket connected: ${userId}`);

    // Personal room for notifications
    socket.join(`user:${userId}`);

    // ── Join Community Room ──────────────────────────────────────
    socket.on('join:community', async ({ communityId }) => {
      if (!communityId) return;

      socket.join(`community:${communityId}`);

      // Broadcast online status to community
      socket.to(`community:${communityId}`).emit('chat:online', {
        communityId,
        userId,
        user: { _id: userId, name: user.name, avatar: user.avatar },
        online: true,
      });

      // Track user's active community for cleanup on disconnect
      socket.data.activeCommunities = socket.data.activeCommunities || new Set();
      socket.data.activeCommunities.add(communityId);
    });

    // ── Leave Community Room ─────────────────────────────────────
    socket.on('leave:community', ({ communityId }) => {
      socket.leave(`community:${communityId}`);
      socket.to(`community:${communityId}`).emit('chat:online', {
        communityId,
        userId,
        online: false,
      });
      socket.data.activeCommunities?.delete(communityId);
    });

    // ── chat:typing ──────────────────────────────────────────────
    // Client emits { communityId, isTyping: true/false }
    socket.on('chat:typing', ({ communityId, isTyping }) => {
      if (!communityId) return;

      socket.to(`community:${communityId}`).emit('chat:typing', {
        communityId,
        userId,
        user: { _id: userId, name: user.name, avatar: user.avatar },
        isTyping: !!isTyping,
      });
    });

    // ── chat:message (via socket) ────────────────────────────────
    // Alternative to REST POST — useful for realtime-first clients
    socket.on('chat:message', async ({ communityId, content, type, attachments, replyTo }) => {
      if (!communityId || !content?.trim()) {
        return socket.emit('chat:error', { message: 'communityId and content are required' });
      }

      // Rate limit check
      const { allowed, remaining } = await socketChatRateLimiter(userId, communityId);
      if (!allowed) {
        return socket.emit('chat:error', {
          message: 'Rate limit exceeded. Max 30 messages per minute.',
          retryAfter: 60,
        });
      }

      try {
        const message = await chatService.saveMessage({
          communityId,
          senderId: userId,
          content: content.trim(),
          type,
          attachments,
          replyTo,
        });

        // Broadcast to everyone in community room (including sender)
        io.to(`community:${communityId}`).emit('chat:message', {
          communityId,
          message,
          remaining,
        });
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${userId}`);

      // Broadcast offline status to all active communities
      if (socket.data.activeCommunities) {
        socket.data.activeCommunities.forEach((communityId) => {
          socket.to(`community:${communityId}`).emit('chat:online', {
            communityId,
            userId,
            online: false,
          });
        });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = initSocket;
module.exports.getIO = getIO;
