const { Server } = require('socket.io');
const { authenticateSocket } = require('./middleware/auth.middleware');
const { socketChatRateLimiter } = require('./middleware/rateLimiter.middleware');
const chatService = require('./chat/chat.service'); // ✅ FIX: correct relative path

let io;

const initSocket = (server, redisClient) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ─── 🔒 FIX 1: Socket.IO JWT Auth Middleware ──────────────────────────────
  // Har naye connection pe JWT verify hoga — bina valid token ke connection reject
  io.use(authenticateSocket);
  // authenticateSocket should:
  //   1. socket.handshake.auth.token ya Authorization header se token nikale
  //   2. jwt.verify() kare
  //   3. socket.user = decoded user set kare
  //   4. Invalid token pe next(new Error('Unauthorized')) call kare

  // ─── Connection Handler ────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.user; // set by authenticateSocket middleware
    const userId = user._id || user.id;

    console.log(`🔌 Socket connected: ${userId}`);

    // Personal room for notifications
    socket.join(`user:${userId}`);

    // ── Join Community Room ──────────────────────────────────────
    socket.on('join:community', async ({ communityId }) => {
      if (!communityId) return;

      socket.join(`community:${communityId}`);

      socket.to(`community:${communityId}`).emit('chat:online', {
        communityId,
        userId,
        user: { _id: userId, name: user.name, avatar: user.avatar },
        online: true,
      });

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
    socket.on('chat:typing', ({ communityId, isTyping }) => {
      if (!communityId) return;
      socket.to(`community:${communityId}`).emit('chat:typing', {
        communityId,
        userId,
        user: { _id: userId, name: user.name, avatar: user.avatar },
        isTyping: !!isTyping,
      });
    });

    // ── chat:message ─────────────────────────────────────────────
    socket.on('chat:message', async ({ communityId, content, type, attachments, replyTo }) => {
      if (!communityId || !content?.trim()) {
        return socket.emit('chat:error', { message: 'communityId and content are required' });
      }

      // 🔒 FIX 2: Redis sliding-window rate limit (socketChatRateLimiter)
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
