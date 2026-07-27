const Message = require('../models/Message');

/**
 * Fetch paginated messages for a community.
 * Uses cursor-based pagination on _id (stable, index-friendly).
 *
 * @param {string} communityId
 * @param {object} options - { cursor, limit, page }
 *   cursor  → ObjectId of last seen message (exclusive upper bound, older messages)
 *   page    → fallback offset-based page (if no cursor provided)
 *   limit   → number of messages to return
 */
const getMessages = async (communityId, { cursor, limit = 30, page = 1 } = {}) => {
  limit = Math.min(parseInt(limit, 10), 100); // cap at 100

  const query = { communityId, deletedAt: null };

  if (cursor) {
    // cursor = _id of the oldest message the client already has
    // fetch messages OLDER than cursor  ↓
    query._id = { $lt: cursor };
  }

  const messages = await Message.find(query)
    .sort({ _id: -1 }) // newest first within the window, reversed for display
    .limit(limit)
    .populate('sender', 'name avatar _id')
    .populate('replyTo', 'content sender _id')
    .lean();

  // nextCursor → the _id of the oldest message in this batch
  const nextCursor = messages.length === limit ? messages[messages.length - 1]._id : null;

  return {
    messages: messages.reverse(), // chronological order for the client
    nextCursor,
    hasMore: !!nextCursor,
  };
};

/**
 * Save a new message to the database.
 */
const saveMessage = async ({ communityId, senderId, content, type = 'text', attachments = [], replyTo = null }) => {
  const message = await Message.create({
    communityId,
    sender: senderId,
    content,
    type,
    attachments,
    replyTo,
  });

  // Return fully populated message for Socket.IO emit
  return message.populate([
    { path: 'sender', select: 'name avatar _id' },
    { path: 'replyTo', select: 'content sender _id' },
  ]);
};

module.exports = { getMessages, saveMessage };
