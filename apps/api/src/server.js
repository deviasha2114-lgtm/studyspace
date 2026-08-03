const express = require('express');
const http = require('http');
const indexModule = require('./index'); // Socket.IO setup
const initSocket = indexModule;
const getIO = indexModule.getIO;
const userRoutes = require('./routes/user');
const friendRoutes = require('./routes/friend');
const studyRoomRoutes = require('./routes/studyRoom');
const chatRoutes = require('./chat/chat.routes');
const aiRoutes = require('./routes/ai.routes');
const gamificationRoutes = require('./routes/gamification');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const flashcardRoutes = require('./routes/flashcard'); // New
const performanceRoutes = require('./routes/performance'); // New
const { protect } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Apply authentication middleware to all API routes
app.use('/api', protect);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/study-rooms', studyRoomRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/flashcards', flashcardRoutes); // New
app.use('/api/performance', performanceRoutes); // New

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize Socket.IO
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO initialized`);
});

module.exports = { app, server };