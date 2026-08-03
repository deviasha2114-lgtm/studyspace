const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../index'); // Import getIO to emit real-time events

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    const whereClause = {
      userId,
      ...(unreadOnly && { isRead: false }),
    };

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PATCH /api/notifications/:notificationId/read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Emit real-time update
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:read', { notificationId });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Emit real-time update
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:allRead');

    res.json({
      success: true,
      message: `Marked ${result.count} notifications as read`,
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

// DELETE /api/notifications/:notificationId
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Emit real-time update
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:deleted', { notificationId });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// DELETE /api/notifications/delete-read
const deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    // Emit real-time update
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:cleared');

    res.json({
      success: true,
      message: `Deleted ${result.count} read notifications`,
    });
  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
};

// Helper function to create a notification
const createNotification = async (userId, type, title, body, link = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        link,
      },
    });

    // Emit real-time notification
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', notification);

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Helper function to create notification for new follower
const notifyNewFollower = async (followerId, followedId) => {
  try {
    const [follower, followed] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId }, select: { name: true, avatarUrl: true } }),
      prisma.user.findUnique({ where: { id: followedId }, select: { id: true } }),
    ]);

    if (!follower || !followed) return;

    await createNotification(
      followed.id,
      'NEW_FOLLOWER',
      'New Follower',
      `${follower.name} started following you`,
      `/profile/${followerId}`
    );
  } catch (error) {
    console.error('Notify new follower error:', error);
  }
};

// Helper function to create notification for new chat message
const notifyNewMessage = async (messageId) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        community: { select: { id: true, name: true } },
      },
    });

    if (!message) return;

    // Get all members of the community except the sender
    const members = await prisma.communityMember.findMany({
      where: {
        communityId: message.communityId,
        userId: { not: message.senderId },
      },
      select: { userId: true },
    });

    // Send notification to each member
    for (const member of members) {
      await createNotification(
        member.userId,
        'CHAT_MESSAGE',
        `New message in ${message.community.name}`,
        `${message.sender.name}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        `/community/${message.communityId}/chat`
      );
    }
  } catch (error) {
    console.error('Notify new message error:', error);
  }
};

// Helper function to create notification for note approval/rejection
const notifyNoteStatusUpdate = async (noteId, status) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        author: { select: { id: true, name: true } },
        community: { select: { id: true, name: true } },
      },
    });

    if (!note) return;

    const notificationType = status === 'APPROVED' ? 'NOTE_APPROVED' : 'NOTE_REJECTED';
    const title = status === 'APPROVED' ? 'Note Approved' : 'Note Rejected';
    const body = status === 'APPROVED'
      ? `Your note "${note.title}" has been approved!`
      : `Your note "${note.title}" was not approved.`;

    await createNotification(
      note.authorId,
      notificationType,
      title,
      body,
      `/note/${noteId}`
    );
  } catch (error) {
    console.error('Notify note status update error:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  createNotification,
  notifyNewFollower,
  notifyNewMessage,
  notifyNoteStatusUpdate,
};