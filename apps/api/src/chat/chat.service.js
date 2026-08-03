const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fetch paginated messages for a community.
 * Uses cursor-based pagination on createdAt (stable, index-friendly).
 *
 * @param {string} communityId
 * @param {object} options - { cursor, limit, page }
 *   cursor  → ISO date string of last seen message (exclusive upper bound, older messages)
 *   page    → fallback offset-based page (if no cursor provided)
 *   limit   → number of messages to return
 */
const getMessages = async (communityId, { cursor, limit = 30, page = 1 } = {}) => {
  limit = Math.min(parseInt(limit, 10), 100); // cap at 100

  const where = {
    communityId,
    // We don't have a deletedAt field in our Message model, but we can add it if needed
    // For now, we'll assume all messages are active
  };

  // If cursor is provided, we want messages older than the cursor
  if (cursor) {
    where.createdAt = {
      lt: new Date(cursor)
    };
  }

  const messages = await prisma.message.findMany({
    where,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc' // newest first
    },
    take: limit + 1 // get one extra to check if there are more
  });

  // Check if there are more messages
  const hasMore = messages.length > limit;
  // If we have more, remove the extra one
  const data = hasMore ? messages.slice(0, -1) : messages;
  // Get the oldest message timestamp for next cursor
  const nextCursor = data.length > 0 ? data[data.length - 1].createdAt.toISOString() : null;

  return {
    messages: data.reverse(), // chronological order for the client
    nextCursor: nextCursor,
    hasMore: hasMore
  };
};

/**
 * Save a new message to the database.
 */
const saveMessage = async ({ communityId, senderId, content, type = 'text', attachments = [], replyTo = null, reactions = [] }) => {
  const message = await prisma.message.create({
    data: {
      communityId,
      senderId,
      content,
      type,
      attachments: attachments.length > 0 ? attachments : null,
      replyTo: replyTo || null,
      reactions: reactions.length > 0 ? reactions : null,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  return message;
};

/**
 * Add a reaction to a message
 * @param {string} communityId - The community ID
 * @param {string} messageId - The message ID
 * @param {string} userId - The user ID adding the reaction
 * @param {string} emoji - The emoji to react with
 * @returns {Promise<Object>} The updated message
 */
const addReaction = async (communityId, messageId, userId, emoji) => {
  // Find the message to ensure it exists and belongs to the community
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      communityId
    }
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Parse existing reactions or initialize empty array
  const reactions = message.reactions ? JSON.parse(message.reactions) : [];

  // Check if user has already reacted with this emoji
  const existingReactionIndex = reactions.findIndex(
    r => r.userId === userId && r.emoji === emoji
  );

  // If user hasn't reacted with this emoji, add the reaction
  if (existingReactionIndex === -1) {
    reactions.push({ userId, emoji });
  }
  // If they have, we could remove it (toggle) but for now we'll keep it as add-only
  // The delete endpoint handles removal

  // Update the message with new reactions
  const updatedMessage = await prisma.message.update({
    where: {
      id: messageId
    },
    data: {
      reactions: reactions.length > 0 ? JSON.stringify(reactions) : null
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  return updatedMessage;
};

/**
 * Remove a reaction from a message
 * @param {string} communityId - The community ID
 * @param {string} messageId - The message ID
 * @param {string} userId - The user ID removing the reaction
 * @param {string} emoji - The emoji to remove
 * @returns {Promise<Object>} The updated message
 */
const removeReaction = async (communityId, messageId, userId, emoji) => {
  // Find the message to ensure it exists and belongs to the community
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      communityId
    }
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Parse existing reactions or initialize empty array
  const reactions = message.reactions ? JSON.parse(message.reactions) : [];

  // Filter out the reaction to remove (if it exists)
  const filteredReactions = reactions.filter(
    r => !(r.userId === userId && r.emoji === emoji)
  );

  // Update the message with new reactions
  const updatedMessage = await prisma.message.update({
    where: {
      id: messageId
    },
    data: {
      reactions: filteredReactions.length > 0 ? JSON.stringify(filteredReactions) : null
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  return updatedMessage;
};

module.exports = { getMessages, saveMessage, addReaction, removeReaction };