const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Send a friend request from one user to another
 * @param {string} requesterId - ID of the user sending the request
 * @param {string} userId - ID of the user receiving the request
 * @returns {Promise<Object>} The created friend request
 */
const sendFriendRequest = async (requesterId, userId) => {
  // Validate that users exist and are not the same
  if (requesterId === userId) {
    throw new Error('Cannot send friend request to yourself');
  }

  const [requester, user] = await Promise.all([
    prisma.user.findUnique({ where: { id: requesterId } }),
    prisma.user.findUnique({ where: { id: userId } })
  ]);

  if (!requester || !user) {
    throw new Error('User not found');
  }

  // Check if already friends
  const existingFriendship = await prisma.friend.findFirst({
    where: {
      OR: [
        { userId: requesterId, friendId: userId },
        { userId: userId, friendId: requesterId }
      ]
    }
  });

  if (existingFriendship) {
    throw new Error('Already friends');
  }

  // Check if request already sent
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      senderId: requesterId,
      receiverId: userId,
      status: 'PENDING'
    }
  });

  if (existingRequest) {
    throw new Error('Friend request already sent');
  }

  // Create friend request
  return await prisma.friendRequest.create({
    data: {
      senderId: requesterId,
      receiverId: userId,
      status: 'PENDING'
    }
  });
};

/**
 * Get friend requests for a user
 * @param {string} userId - ID of the user
 * @param {string} type - Type of requests: 'sent', 'received', or undefined for both
 * @returns {Promise<Object[]>} Array of friend requests with sender/receiver info
 */
const getFriendRequests = async (userId, type = 'received') => {
  let whereClause = {};

  if (type === 'sent') {
    whereClause = { senderId: userId, status: 'PENDING' };
  } else if (type === 'received') {
    whereClause = { receiverId: userId, status: 'PENDING' };
  } else {
    // Get both sent and received requests
    const [sent, received] = await Promise.all([
      prisma.friendRequest.findMany({
        where: { senderId: userId, status: 'PENDING' },
        include: { receiver: { select: { id: true, name: true } } }
      }),
      prisma.friendRequest.findMany({
        where: { receiverId: userId, status: 'PENDING' },
        include: { sender: { select: { id: true, name: true } } }
      })
    ]);

    return {
      sent: sent.map(req => ({
        ...req,
        toUser: req.receiver
      })),
      received: received.map(req => ({
        ...req,
        fromUser: req.sender
      }))
    };
  }

  const requests = await prisma.friendRequest.findMany({
    where: whereClause,
    include: {
      sender: true,
      receiver: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Format response based on type
  if (type === 'sent') {
    return requests.map(req => ({
      ...req,
      toUser: req.receiver
    }));
  } else {
    // received
    return requests.map(req => ({
      ...req,
      fromUser: req.sender
    }));
  }
};

/**
 * Respond to a friend request (accept or reject)
 * @param {string} requestId - ID of the friend request
 * @param {string} userId - ID of the user responding (must be the receiver)
 * @param {string} action - 'accept' or 'reject'
 * @returns {Promise<Object>} Result object with message and friend request
 */
const respondToFriendRequest = async (requestId, userId, action) => {
  const friendRequest = await prisma.friendRequest.findUnique({
    where: { id: requestId },
    include: {
      sender: true,
      receiver: true
    }
  });

  if (!friendRequest) {
    throw new Error('Friend request not found');
  }

  if (friendRequest.receiverId !== userId) {
    throw new Error('Not authorized to respond to this request');
  }

  let result;

  if (action === 'accept') {
    // Update request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    // Create friendship (mutual)
    await prisma.friend.create({
      data: {
        userId: friendRequest.senderId,
        friendId: friendRequest.receiverId
      }
    });

    // Also create reverse relationship for easier querying
    await prisma.friend.create({
      data: {
        userId: friendRequest.receiverId,
        friendId: friendRequest.senderId
      }
    });

    result = { message: 'Friend request accepted', friendRequest };
  } else if (action === 'reject') {
    // Update request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    result = { message: 'Friend request rejected', friendRequest };
  } else {
    throw new Error('Invalid action. Use "accept" or "reject"');
  }

  return result;
};

/**
 * Get friends list for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<Object[]>} Array of friend objects with profile info
 */
const getFriends = async (userId) => {
  const friends = await prisma.friend.findMany({
    where: { userId: userId },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          // Note: Assuming User model has username and image fields
          // Adjust based on actual User model fields
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Extract just the friend data
  return friends.map(f => f.friend);
};

/**
 * Remove a friend connection
 * @param {string} userId - ID of the user
 * @param {string} friendId - ID of the friend to remove
 * @returns {Promise<Object>} Result object
 */
const removeFriend = async (userId, friendId) => {
  // Verify both users exist
  const [user, friend] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findUnique({ where: { id: friendId } })
  ]);

  if (!user || !friend) {
    throw new Error('User not found');
  }

  // Delete both directions of the friendship
  await Promise.all([
    prisma.friend.deleteMany({
      where: {
        userId: userId,
        friendId: friendId
      }
    }),
    await prisma.friend.deleteMany({
      where: {
        userId: friendId,
        friendId: userId
      }
    })
  ]);

  return { message: 'Friend removed successfully' };
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend
};