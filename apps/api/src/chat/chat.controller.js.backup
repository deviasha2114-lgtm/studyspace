const chatService = require('./chat.service');
const { getIO } = require('../index');
const { hasFeatureAccess } = require('../lib/subscription');

/**
 * GET /api/chat/:communityId/messages?page=&limit=&cursor=
 * Cursor-based pagination — prefer `cursor` over `page`
 */
const getMessages = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const { cursor, limit, page } = req.query;

    const result = await chatService.getMessages(communityId, { cursor, limit, page });

    return res.json({
      success: true,
      data: result.messages,
      pagination: {
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        limit: parseInt(limit, 10) || 30,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/chat/:communityId/messages
 * Save message + emit via Socket.IO
 */
const sendMessage = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const senderId = req.user._id || req.user.id;
    const { content, type, attachments, replyTo } = req.body;

    // If there are attachments, check if the user has the attachment sharing feature
    if (attachments && attachments.length > 0) {
      const hasAccess = await hasFeatureAccess(senderId, 'Attachment sharing in chat');
      if (!hasAccess) {
        return res.status(403).json({ error: 'Attachment sharing requires a subscription. Please upgrade to access this feature.' });
      }
    }

    if (!content?.trim() && attachments.length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await chatService.saveMessage({
      communityId,
      senderId,
      content: content?.trim(),
      type,
      attachments,
      replyTo,
    });

    // Emit to all community members in real-time
    const io = getIO();
    io.to(`community:${communityId}`).emit('chat:message', {
      communityId,
      message,
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/chat/:communityId/messages/:messageId/reactions
 * Add a reaction to a message
 */
const addReaction = async (req, res, next) => {
  try {
    const { communityId, messageId } = req.params;
    const userId = req.user._id || req.user.id;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await chatService.addReaction(communityId, messageId, userId, emoji);

    // Emit to all community members in real-time
    const io = getIO();
    io.to(`community:${communityId}`).emit('chat:reactionAdded', {
      communityId,
      messageId,
      userId,
      emoji,
    });

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/chat/:communityId/messages/:messageId/reactions
 * Remove a reaction from a message
 */
const removeReaction = async (req, res, next) => {
  try {
    const { communityId, messageId } = req.params;
    const userId = req.user._id || req.user.id;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await chatService.removeReaction(communityId, messageId, userId, emoji);

    // Emit to all community members in real-time
    const io = getIO();
    io.to(`community:${communityId}`).emit('chat:reactionRemoved', {
      communityId,
      messageId,
      userId,
      emoji,
    });

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages, sendMessage, addReaction, removeReaction };